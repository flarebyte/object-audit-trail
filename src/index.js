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
        author: ['i.author.name', 'i.author.alternateName'],
        license: ['r.license.name', 'r.license.alternateName'],
        headline: ['r.headline', 'r.alternativeHeadline'],
        typeOfWork: ['r.typeOfWork.name'],
      },
      placeholders: {
        clean: [],
        extract: [['{{', '}}']],
      },

    },
    ii: {
      templates: ['"{{headline1}}" by {{author1}} is a derivative of ' +
      '"{{headline2}}" by {{author2}} / {{license}}'],
      props: {
        author1: ['i.author.name', 'i.author.alternateName'],
        author2: ['ii.author.name', 'ii.author.alternateName'],
        license: ['r.license.name', 'r.license.alternateName'],
        headline1: ['r.headline', 'r.alternativeHeadline'],
        headline2: ['ii.headline', 'ii.alternativeHeadline'],
      },
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
        author: ['i.author.name', 'i.author.alternateName'],
        authorUrl: ['i.author.url'],
        license: ['r.license.name', 'r.license.alternateName'],
        licenseUrl: ['r.license.url'],
        headline: [quote, 'r.headline', 'r.alternativeHeadline'],
        headlineUrl: ['r.url'],
        typeOfWork: ['r.typeOfWork.name'],
        typeOfWorkUrl: ['r.typeOfWork.url'],
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
        author: ['i.author.name', 'i.author.alternateName'],
        authorTwitter: ['i.author.twitter:username'],
        authorUrl: ['i.author.url'],
        license: ['r.license.name', 'r.license.alternateName'],
        licenseUrl: ['r.license.url'],
        licenseHashtag: ['r.license.twitter:hastag'],
        headline: ['r.headline', 'r.alternativeHeadline'],
        headlineUrl: ['r.url'],
        typeOfWork: ['r.typeOfWork.name'],
        typeOfWorkUrl: ['r.typeOfWork.url'],
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

  const buildTemplating = (templating) => {
    const decorePaths = (list, key) => {
      const isUrl = _.endsWith(key, 'Url');
      if (isUrl) {
        list.unshift(uncurie);
      }
      return list;
    };

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


  const onlyMajorContributions = history => _.filter(history, onlyMajor);

  const listAuthors = history => _.uniqBy(_.map(history, 'author'), 'name');
  const hasSingleMajorContributor = history =>
  _.size(listAuthors(onlyMajorContributions(history))) === 1;

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

  const getSingleAuthorAttribution = (history, templating, limit) => {
    const r = _.last(history);
    const majorContribs = onlyMajorContributions(history);
    const i = _.last(majorContribs);
    return pickAltVal.renderLongest(templating, { r, i }, limit);
  };

  const getTwoAuthorsAttribution = (history, templating, limit) => {
    const r = _.last(history);
    const majorContribs = onlyMajorContributions(history);
    const i = _.last(majorContribs);
    const lastAuthor = _.get(i, 'author.name');
    const exceptLastAuthor = c => _.get(c, 'author.name') !== lastAuthor;
    const contribsOther = _.filter(majorContribs, exceptLastAuthor);
    const ii = _.last(contribsOther);
    return pickAltVal.renderLongest(templating, { r, i, ii }, limit);
  };


  const getAttribution = (history, opts) => {
    const limit = _.get(opts, 'limit', 10000);
    const format = _.get(opts, 'format', 'text');

    const templatings = _.get(custom, format);
    const single = hasSingleMajorContributor(history);
    const attr = single ?
    getSingleAuthorAttribution(history, templatings.i, limit) :
    getTwoAuthorsAttribution(history, templatings.ii, limit);
    return attr;
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
