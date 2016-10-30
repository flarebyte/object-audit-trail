import _ from "lodash"

/**
 * @param {Type}
 * @return {Type}
 */
export default function (conf) {
  const shorterOfTwo = (first, second) => {
    if (_.isNil(second)) {
      return first;
    }
    return _.size(first) < _.size(second) ? first : second;
  };

  const largestPossible = (list, maxSize) => {
    const sizeOrZero = (n) => {
      return _.size(n)> maxSize ? 0: _.size(n);
    }
    const largest = _.maxBy(list, sizeOrZero);
    return sizeOrZero(largest) === 0 ? null : largest;
  }

  const isLicensedUnder = " is licensed under "
  const getIdealAttributionAsText = (history) => {
    const last = _.last(history);
    const headline = last.headline;
    const author = last.author.name;
    const license = last.license.name;
    const under = isLicensedUnder;
    const attribution = `${headline} by ${author}${under}${license}`;
    return attribution;
  }

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
  }

  const getShorterAttributionAsText = (history, limit) => {
    const last = _.last(history);
    const author = shorterOfTwo(last.author.name, last.author.alternateName);
    if (_.size(author)+3 >= limit) {
      return null;
    }
    const license = shorterOfTwo(last.license.name, last.license.alternateName);
    const under = " / ";
    const attributionCredit = `by ${author}${under}${license}`;
    if (_.size(attributionCredit) > limit) {
      return `By ${author}`;
    }
    const maxHeadline = limit - 1 - _.size(attributionCredit);
    const headline = largestPossible([
      last.headline,
      last.alternativeHeadline,
      last.typeOfWork.name
    ], maxHeadline);

    if (_.isNil(headline)) {
      return _.upperFirst(attributionCredit);
    }
    const attribution = `${headline} by ${author}${under}${license}`;
    return attribution;
  }


  const getAttributionAsText = (history , limit) => {
    const defaultAttrib = getIdealAttributionAsText(history);
    const useDefault = _.isNil(limit) || _.size(defaultAttrib) <= limit;
    return useDefault ? defaultAttrib :
    getShorterAttributionAsText(history, limit);
  }

  const getAttributionAsMarkdown = (history) => {
    return getIdealAttributionAsMd(history);
  }

  const getTwitterAttribution = (history) => {
    const last = _.last(history);
    const headline = largestPossible([
      last.headline,
      last.alternativeHeadline,
      last.typeOfWork.name
    ], 60);
    const url = `${conf.baseUrl}${last.url}`;
    const defAuthor = shorterOfTwo(last.author.name, last.author.alternateName);
    const author = _.defaultTo(last.author['twitter:username'], defAuthor);
    const license = last.license['twitter:hastag'];
    const attribution = `${headline} by ${author} ${license}: ${url}`;
    return attribution;
  }

  const objectAuditTrail = {
    shorterOfTwo,
    largestPossible,
    getAttributionAsText,
    getAttributionAsMarkdown,
    getTwitterAttribution
  }
  return objectAuditTrail;
}
