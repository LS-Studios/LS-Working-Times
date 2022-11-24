const React = require('react');
const hoistStatics = require('hoist-non-react-statics');
const objectAssign = require('object-assign');

const subscribes = {};

let defaultTheme = 'dark';
let currentTheme = 'dark';
let count = 0;

export function subscribe(cb) {
    const newId = count;
    subscribes[newId] = cb;
    count += 1;
    return newId;
}

export function unsubscribe(id) {
    delete subscribes[id];
}

export function triggerSubscriptions() {
    Object.keys(subscribes).forEach((id) => {
        new Promise((resolve) => {
            subscribes[id]();
            resolve();
        }).then();
    });
}

export function getDefaultTheme() {
    return defaultTheme;
}

export function getCurrentTheme() {
    return currentTheme;
}

export function setDefaultTheme(lang) {
    defaultTheme = lang;
    currentTheme = lang;
}

export function setTheme(theme) {
    currentTheme = theme;
    triggerSubscriptions();
}

export function getThemeClass(path, theme) {
    path = path.charAt(0).toUpperCase() + path.slice(1)

    if (!theme)
        return currentTheme + path
    else
        return theme + path
}

export function setThemeUp(Component) {
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