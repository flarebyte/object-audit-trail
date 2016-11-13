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

  const byAuthorTempl = 'By ${author}';
  const byAuthorTemplZ = pickAltVal.discardPlaceholders(byAuthorTempl);
  const byAuthorAndLicenseTempl = 'By ${author}${under}${license}';
  const byAuthorAndLicenseTemplZ = pickAltVal.discardPlaceholders(
    byAuthorAndLicenseTempl);
  const byAuthorWithHeadline = '"${headline}" by ${author}${under}${license}';
  const byAuthorWithHeadlineZ = pickAltVal.discardPlaceholders(
  byAuthorWithHeadline);
  const defaultOptions = { limit: 10000, strategy: 'length/priority' };

  const getSingleAuthorAttributionAsText = (history, opts = defaultOptions) => {
    const filterFn = list => pickAltVal.sumSize(list) <= opts.limit &&
       pickAltVal.hasNoNull(list);
    const rankFn = list => pickAltVal.sumSize(list);

    const last = _.last(history);
    const altAuthor = [last.author.name];
    const altLicense = [last.license.name];
    const altUnder = [isLicensedUnder];
    const altHeadline = [last.headline];
    const headlineByAuthor = [[byAuthorWithHeadlineZ],
      altHeadline, altAuthor, altUnder, altLicense];
    const headlineByAuthorBest =
    pickAltVal.highestRankedCombination(headlineByAuthor, rankFn, filterFn);
    if (!_.isNil(headlineByAuthorBest)) {
      return _.template(byAuthorWithHeadline)({
        headline: headlineByAuthorBest[1],
        author: headlineByAuthorBest[2],
        under: headlineByAuthorBest[3],
        license: headlineByAuthorBest[4],
      });
    }


    const byAuthorAndLicense = [[byAuthorAndLicenseTemplZ],
      altAuthor, altUnder, altLicense,
    ];
    const byAuthorAndLicenseBest =
    pickAltVal.highestRankedCombination(byAuthorAndLicense, rankFn, filterFn);
    if (!_.isNil(byAuthorAndLicenseBest)) {
      return _.template(byAuthorWithHeadline)({
        author: headlineByAuthorBest[1],
        under: headlineByAuthorBest[2],
        license: headlineByAuthorBest[3],
      });
    }


    const byAuthor = [[byAuthorTemplZ], altAuthor];
    const byAuthorBest =
    pickAltVal.highestRankedCombination(byAuthor, rankFn, filterFn);
    if (!_.isNil(byAuthorBest)) {
      return _.template(byAuthorWithHeadline)({
        author: headlineByAuthorBest[1],
      });
    }

    return null;
  };

  const getAttributionAsText = (history, limit) =>
     getSingleAuthorAttributionAsText(history, limit)
  ;

  const getAttributionAsMarkdown = history =>
     getIdealAttributionAsMd(history)
  ;

  const getTwitterAttribution = (history) => {
    const last = _.last(history);
    const headline = pickAltVal.pickLongestSize([
      `"${last.headline}"`,
      `"${last.alternativeHeadline}"`,
      last.typeOfWork.name,
    ], 60);
    const url = `${conf.baseUrl}${last.url}`;
    const defAuthor = pickAltVal.pickShortestSize(
      [last.author.name, last.author.alternateName]
    );
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
