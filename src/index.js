import _ from 'lodash';
import pickAltVal from 'pick-alternate-value';

const defProps = {
  author: ['author.name', 'author.alternateName'],
  license: ['license.name', 'license.alternateName'],
  headline: ['headline', 'alternativeHeadline'],
  typeOfWork: ['typeOfWork.name'],
};

const quote = str => `"${str}"`;

const defaults = {
  text: {
    i: {
      templates: ['"{{headline}}" by {{author}} is licensed under {{license}}',
        '"{{headline}}" by {{author}} / {{license}}',
        '{{typeOfWork}} by {{author}} / {{license}}',
        'By {{author}} / {{license}}', 'By {{author}}'],
      props: {
        author: ['author.name', 'author.alternateName'],
        license: ['license.name', 'license.alternateName'],
        headline: ['headline', 'alternativeHeadline'],
        typeOfWork: ['typeOfWork.name'],
      },
      placeholders: {
        clean: [],
        extract: [['{{', '}}']],
      },

    },
    ii: {
      templates: [],
      props: defProps,
      placeholders: {
        clean: [],
        extract: [['{{', '}}']],
      },
    },
  },
  markdown: {
    i: {
      templates: ['[{{headline}}]({{headlineUrl}}) by ' +
      '[{{author}}]({{authorUrl}}) is licensed under [{{license}}]({{licenseUrl}})',
        '[{{headline}}]({{headlineUrl}}) by ' +
      '[{{author}}]({{authorUrl}}) / [{{license}}]({{licenseUrl}})',
        '[{{typeOfWork}}]({{headlineUrl}}) by ' +
        '[{{author}}]({{typeOfWorkUrl}}) / [{{license}}]({{licenseUrl}})',
        'By [{{author}}]({{authorUrl}}) / [{{license}}]({{licenseUrl}})',
        'By [{{author}}]({{authorUrl}})'],
      props: {
        author: ['author.name', 'author.alternateName'],
        authorUrl: ['author.url'],
        license: ['license.name', 'license.alternateName'],
        licenseUrl: ['license.url'],
        headline: [quote, 'headline', 'alternativeHeadline'],
        headlineUrl: ['url'],
        typeOfWork: ['typeOfWork.name'],
        typeOfWorkUrl: ['typeOfWork.url'],
      },
      placeholders: {
        clean: [['({{', '}})']],
        extract: [['[{{', '}}]'], ['({{', '}})']],
      },

    },
    ii: {
      templates: [],
      props: defProps,
      placeholders: {
        clean: [['({{', '}}])']],
        extract: [['[{{', '}}]'], ['({{', '}}])']],
      },
    },
  },
  twitter: {
    i: {
      templates: [
        '"{{headline}}" by {{authorTwitter}} {{licenseHashtag}}: {{headlineUrl}}',
      ],
      props: {
        author: ['author.name', 'author.alternateName'],
        authorTwitter: ['author.twitter:username'],
        authorUrl: ['author.url'],
        license: ['license.name', 'license.alternateName'],
        licenseUrl: ['license.url'],
        licenseHashtag: ['license.twitter:hastag'],
        headline: ['headline', 'alternativeHeadline'],
        headlineUrl: ['url'],
        typeOfWork: ['typeOfWork.name'],
        typeOfWorkUrl: ['typeOfWork.url'],
      },
      placeholders: {
        clean: [['({{', '}}])']],
        extract: [['[{{', '}}]'], ['({{', '}}])']],
      },
    },
    ii: {
      templates: [],
      props: defProps,
      placeholders: {
        clean: [['({{', '}}])']],
        extract: [['[{{', '}}]'], ['({{', '}}])']],
      },
    },
  },
};


/**
 * @param {Type}
 * @return {Type}
 */
export default function (conf) {
  const buildTemplating = (templating) => {
    const decorePaths = list =>
      // list.unshift('description');
       list
    ;
    const props = _.mapValues(templating.props, decorePaths);
    return { props,
      templates: templating.templates,
      placeholders: templating.placeholders,
    };
  };

  const buildVariations = variations => _.mapValues(variations, buildTemplating);
  const buildAllTemplating = v => _.mapValues(v, buildVariations);

  const customDefaults = _.defaults(_.get(conf, 'custom', {}), defaults);

  const custom = buildAllTemplating(customDefaults);

  const onlyMajor = value => !_.includes(
      conf.ignoreTypeOfContribution,
      value.typeOfContribution.name);

  const listAuthors = history => _.uniqBy(_.map(history, 'author'), 'name');
  const onlyMajorContributions = history => _.filter(history, onlyMajor);

  const copyeditedContributionAfter = (history, url) => {
    let edition = null;
    for (let i = 0; i < history.length; i += 1) {
      const ed = history[i];
      if (ed.url === url) {
        edition = ed;
        continue;
      }
      if (edition === null) continue;
      if (onlyMajor(ed)) break;
      edition = ed;
    }
    return edition;
  };
  const getLastContribution = _.last;
  const getSingleAuthorAttribution = (history, templating, limit) => {
    const last = getLastContribution(history);
    return pickAltVal.renderLongest(templating, last, limit);
  };

  const uncurie = (path) => {
    const isNilOrHttp = _.isNil(path) || _.isEmpty(path) ||
     _.startsWith(path, 'http://') || _.startsWith(path, 'https://');
    if (isNilOrHttp) {
      return path;
    }
    const hasCurie = _.includes(path, ':');
    if (!hasCurie) {
      const pathSuffix = _.trimStart(path, '/');
      const url = `${conf.baseUrl}/${pathSuffix}`;
      return url;
    }
    const splitted = _.split(path, ':');
    const prefix = _.head(splitted);
    const unkownCurie = !_.has(conf.curies, prefix);
    if (unkownCurie) {
      return path;
    }
    const relUrl = _.tail(splitted).join(':');
    const curieUrl = conf.curies[prefix];
    const url = `${curieUrl}/${relUrl}`;
    return url;
  };


  const getAttribution = (history, opts) => {
    const limit = _.get(opts, 'limit', 10000);
    const format = _.get(opts, 'format', 'text');

    const templatings = _.get(custom, format);
    return getSingleAuthorAttribution(history, templatings.i, limit);
  }
  ;

  const objectAuditTrail = {
    uncurie,
    onlyMajorContributions,
    copyeditedContributionAfter,
    getAttribution,
  };
  return objectAuditTrail;
}
