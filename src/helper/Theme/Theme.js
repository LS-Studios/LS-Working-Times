const React = require('react');
const hoistStatics = require('hoist-non-react-statics');
const objectAssign = require('object-assign');

const subscribes = {};

let defaultTheme = 'dark';
let currentTheme = 'dark';
let count = 0;

function subscribe(cb) {
    const newId = count;
    subscribes[newId] = cb;
    count += 1;
    return newId;
}

function unsubscribe(id) {
    delete subscribes[id];
}

function triggerSubscriptions() {
    Object.keys(subscribes).forEach((id) => {
        new Promise((resolve) => {
            subscribes[id]();
            resolve();
        }).then();
    });
}

function getDefaultTheme() {
    return defaultTheme;
}

function getCurrentTheme() {
    return currentTheme;
}

function setDefaultTheme(lang) {
    defaultTheme = lang;
    currentTheme = lang;
}

function setTheme(theme) {
    currentTheme = theme;
    triggerSubscriptions();
}

function getThemeClass(path, theme) {
    path = path.charAt(0).toUpperCase() + path.slice(1)

    if (!theme)
        return currentTheme + path
    else
        return theme + path
}

function setThemeUp(Component) {
    class ThemeComponet extends React.Component {
        componentDidMount() {
            this.id = subscribe(() => this.forceUpdate());
        }

        componentWillUnmount() {
            unsubscribe(this.id);
        }

        render() {
            return React.createElement(
                Component,
                objectAssign({}, this.props, { t: (key, args, lang) => getThemeClass(key, args, lang) }),
            );
        }
    }

    return hoistStatics(ThemeComponet, Component);
}

module.exports = {
    getDefaultTheme,
    getCurrentTheme,
    setDefaultTheme,
    setTheme,
    setThemeUp,
    subscribe,
    unsubscribe,
    getThemeClass,
};