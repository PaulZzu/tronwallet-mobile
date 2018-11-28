import moment from 'moment'

export function postFormat (date, formatOut = 'DD MMM YYYY') {
  const tempData = moment(date)
  if (tempData.isBefore(new Date(), 'day')) {
    return tempData.format(formatOut)
  }
  return tempData.fromNow()
}
