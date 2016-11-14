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

  const blk = str => pickAltVal.discardPlaceholders(str);
  const quote = value => `"${value}"`;

  const isLicensedUnder = ' is licensed under ';
  const byAuthorTempl = 'By ${author}';
  const byAuthorTemplMd = 'By [${author}](${authorUrl})';
  const byAuthorAndLicenseTempl = 'By ${author}${under}${license}';
  const byAuthorWithHeadlineTempl = '${headline} by ${author}${under}${license}';

  const altUnder = [isLicensedUnder, ' / ', '/'];

  const rankFn = list => pickAltVal.sumSize(list);

  const runByAuthorTempl = (list) => {
    const params = {
      author: list[1],
    };
    return _.template(byAuthorTempl)(params);
  };

  const runByAuthorTemplMd = (list) => {
    const params = {
      author: list[1],
      authorUrl: list[2],
    };
    return _.template(byAuthorTemplMd)(params);
  };

  const runByAuthorAndLicenseTempl = (list) => {
    const params = {
      author: list[1],
      under: list[2],
      license: list[3],
    };
    return _.template(byAuthorAndLicenseTempl)(params);
  };

  const runByAuthorWithHeadlineTempl = (list) => {
    const params = {
      headline: list[1],
      author: list[2],
      under: list[3],
      license: list[4],
    };
    return _.template(byAuthorWithHeadlineTempl)(params);
  };


  const getSingleAuthorAttributionAsText = (history, opts) => {
    const limit = _.get(opts, 'limit', 10000);
    const filterFn = list => pickAltVal.hasNoNull(list) &&
    pickAltVal.sumSize(list) <= limit;

    const bestOf = list => pickAltVal.highestRankedCombination(
      pickAltVal.combineListOfList(list), rankFn, filterFn);

    const last = _.last(history);
    const altAuthor = [last.author.name, last.author.alternateName];
    const altLicense = [last.license.name, last.license.alternateName];
    const altHeadline = [quote(last.headline),
      quote(last.alternativeHeadline),
      last.typeOfWork.name];
    const headlineByAuthor = [[blk(byAuthorWithHeadlineTempl)],
      altHeadline, altAuthor, altUnder, altLicense];
    const headlineByAuthorBest = bestOf(headlineByAuthor);
    if (!_.isNil(headlineByAuthorBest)) {
      return runByAuthorWithHeadlineTempl(headlineByAuthorBest);
    }

    const byAuthorAndLicense = [[blk(byAuthorAndLicenseTempl)],
      altAuthor, altUnder, altLicense,
    ];
    const byAuthorAndLicenseBest = bestOf(byAuthorAndLicense);
    if (!_.isNil(byAuthorAndLicenseBest)) {
      return runByAuthorAndLicenseTempl(byAuthorAndLicenseBest);
    }

    const byAuthor = [[blk(byAuthorTempl)], altAuthor];
    const byAuthorBest = bestOf(byAuthor);
    if (!_.isNil(byAuthorBest)) {
      return runByAuthorTempl(byAuthorBest);
    }

    return null;
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
