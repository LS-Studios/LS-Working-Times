const React = require('react');
const hoistStatics = require('hoist-non-react-statics');
const objectAssign = require('object-assign');

const subscribes = {};

let translations = {};
let defaultLanguage = 'en';
let language = 'en';
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

export function getLanguages() {
    return Object.keys(translations);
}

export function getDefaultLanguage() {
    return defaultLanguage;
}

export function getLanguage() {
    return language;
}

export function setDefaultLanguage(lang) {
    defaultLanguage = lang;
    language = lang;
}

export function setLanguage(lang) {
    if (getLanguages().indexOf(lang) === -1) {
        return;
    }

    language = lang;
    triggerSubscriptions();
}

export function setTranslations(userTranslations) {
    translations = userTranslations;
    triggerSubscriptions();
}

export function setDefaultTranslations(userTranslations) {
    if (getLanguages().length !== 0) {
        setTranslations(userTranslations);
        return;
    }
    translations = userTranslations;
}

export function getTranslation(lang) {
    return translations[lang];
}

export function t(path, params, lang) {
    const selectLang = lang || language;

    function fallback() {
        if (selectLang !== defaultLanguage) {
            return t(path, params, defaultLanguage);
        }
        return path;
    }

    let translationObj = getTranslation(selectLang);

    if (!translationObj) {
        return fallback();
    }

    const translationKeys = path.split('.');
    let translation = '';

    translationKeys.forEach((key) => {
        const temp = translationObj[key];
        if (typeof translationObj[key] === 'object') {
            translationObj = translationObj[key];
        } else if (typeof temp === 'string') {
            translation = temp;
        }
    });

    console.log(path)

    if (!translation) {
        return fallback();
    }

    if (params) {
        Object.keys(params).forEach((key) => {
            const replace = `{${key}}`;
            translation = translation.replace(replace, params[key]);
        });
    }

    return translation;
}

export function translate(Component) {
    class TranslatedComponet extends React.Component {
        componentDidMount() {
            this.id = subscribe(() => this.forceUpdate());
        }

        componentWillUnmount() {
            unsubscribe(this.id);
        }

        render() {
            return React.createElement(
                Component,
                objectAssign({}, this.props, { t: (key, args, lang) => t(key, args, lang) }),
            );
        }
    }

    return hoistStatics(TranslatedComponet, Component);
}