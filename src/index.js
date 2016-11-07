import _ from 'lodash';
import pickAltVal from 'pick-alternate-value';

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

  const isLicensedUnder = ' is licensed under ';
  const getIdealAttributionAsText = (history) => {
    const last = _.last(history);
    const headline = last.headline;
    const author = last.author.name;
    const license = last.license.name;
    const under = isLicensedUnder;
    const attribution = `"${headline}" by ${author}${under}${license}`;
    return attribution;
  };

  const getIdealAttributionAsMd = (history) => {
    const last = _.last(history);
    const headline = last.headline;
    const url = last.url;
    const author = last.author.name;
    const authorUrl = last.author.url;
    const license = last.license.name;
    const licenseUrl = last.license.url;
    const under = isLicensedUnder;
    const attribution =
    `[${headline}](${url}) by [${author}](${authorUrl})${under}[${license}](${licenseUrl})`;
    return attribution;
  };

  const getShorterAttributionAsText = (history, limit) => {
    const last = _.last(history);
    const author = shorterOfTwo(last.author.name, last.author.alternateName);
    if (_.size(author) + 3 >= limit) {
      return null;
    }
    const license = shorterOfTwo(last.license.name, last.license.alternateName);
    const under = ' / ';
    const attributionCredit = `by ${author}${under}${license}`;
    if (_.size(attributionCredit) > limit) {
      return `By ${author}`;
    }
    const maxHeadline = limit - 1 - _.size(attributionCredit);
    const headline = largestPossible([
      `"${last.headline}"`,
      `"${last.alternativeHeadline}"`,
      last.typeOfWork.name,
    ], maxHeadline);

    if (_.isNil(headline)) {
      return _.upperFirst(attributionCredit);
    }
    const attribution = `${headline} by ${author}${under}${license}`;
    return attribution;
  };

  const getOptimizedAttributionAsText = (contrib, conf) => {
    const author = shorterOfTwo(contrib.author.name, contrib.author.alternateName);
    const license = shorterOfTwo(contrib.license.name, contrib.license.alternateName);
    const under = ' / ';
    const attributionCredit = `by ${author}${under}${license}`;
    const headline = largestPossible([
      `"${contrib.headline}"`,
      `"${contrib.alternativeHeadline}"`,
      contrib.typeOfWork.name,
    ], contrib.headLineMaxSize);

    const attribution = `${headline} by ${author}${under}${license}`;
    return attribution;
  };

  const getAttributionAsTextDefault = (history, limit) => {
    const hasSingleAuthor = _.size(listAuthors(history)) === 1;
    if (hasSingleAuthor) {
      return getIdealAttributionAsText(history);
    }
    const last = _.last(history);
    return '';
  };

  const getAttributionAsText = (history, limit) => {
    const defaultAttrib = getAttributionAsTextDefault(history, limit);
    const useDefault = _.isNil(limit) || _.size(defaultAttrib) <= limit;
    return useDefault ? defaultAttrib :
    getShorterAttributionAsText(history, limit);
  };

  const getAttributionAsMarkdown = history =>
     getIdealAttributionAsMd(history)
  ;

  const getTwitterAttribution = (history) => {
    const last = _.last(history);
    const headline = largestPossible([
      `"${last.headline}"`,
      `"${last.alternativeHeadline}"`,
      last.typeOfWork.name,
    ], 60);
    const url = `${conf.baseUrl}${last.url}`;
    const defAuthor = shorterOfTwo(last.author.name, last.author.alternateName);
    const author = _.defaultTo(last.author['twitter:username'], defAuthor);
    const license = last.license['twitter:hastag'];
    const attribution = `${headline} by ${author} ${license}: ${url}`;
    return attribution;
  };

  const objectAuditTrail = {
    onlyMajorContributions,
    copyeditedContributionAfter,
    getAttributionAsText,
    getAttributionAsMarkdown,
    getTwitterAttribution,
  };
  return objectAuditTrail;
}
