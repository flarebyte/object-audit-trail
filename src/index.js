import _ from 'lodash';
import pickAltVal from 'pick-alternate-value';

const defTextTemplates = ['{{headline}} by {{author}} is licensed under {{license}}',
  '{{headline}} by {{author}} / {{license}}',
  'By {{author}} / {{license}}', 'By {{author}}'];

const defMdTemplates = ['[{{headline}}]({{headlineUrl}}) by' +
'[{{author}}]({{authorUrl}}) is licensed under [{{license}}]({{licenseUrl}})',
  '[{{headline}}]({{headlineUrl}}) by' +
'[{{author}}]({{authorUrl}}) / [{{license}}]({{licenseUrl}})',
  'By [{{author}}]({{authorUrl}}) / [{{license}}]({{licenseUrl}})',
  'By [{{author}}]({{authorUrl}})'];

const defProps = {
  author: ['author.name', 'author.alternateName'],
  license: ['license.name', 'license.alternateName'],
  headline: ['headline', 'alternativeHeadline'],
  typeOfWork: ['typeOfWork.name'],
};


const defTextPlaceholders = {
  clean: [],
  extract: [['{{', '}}']],
};

const defMdPlaceholders = {
  clean: [['({{', '}}])']],
  extract: [['[{{', '}}]'], ['({{', '}}])']],
};

/**
 * @param {Type}
 * @return {Type}
 */
export default function (conf) {
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

  const getSingleAuthorAttributionAsText = (history, opts) => {
    const limit = _.get(opts, 'limit', 10000);
    const format = _.get(opts, 'format', 'text');
  };

  const getAttributionAsText = (history, opts) =>
     getSingleAuthorAttributionAsText(history, opts)
  ;

  const getAttributionAsMarkdown = (history, opts) =>
     getSingleAuthorAttributionAsText(history, opts)
  ;

  const getTwitterAttribution = (history, opts) =>
     getSingleAuthorAttributionAsText(history, opts)
  ;

  const objectAuditTrail = {
    onlyMajorContributions,
    copyeditedContributionAfter,
    getAttributionAsText,
    getAttributionAsMarkdown,
    getTwitterAttribution,
  };
  return objectAuditTrail;
}
