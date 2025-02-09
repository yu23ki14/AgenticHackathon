export const extractTagValue = (input: string, tagName: string) => {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, "i")
  const match = input.match(regex)
  return match ? match[1] : null
}

export const parseTransferRequestsWithRegex = (xmlString: string) => {
  const transferRequestRegex = /<TransferRequest>(.*?)<\/TransferRequest>/gs
  const fieldRegex = /<(\w+)>(.*?)<\/\1>/g

  const results = []
  let requestMatch

  // 各TransferRequest要素を順に処理
  while ((requestMatch = transferRequestRegex.exec(xmlString)) !== null) {
    const requestContent = requestMatch[1]
    const fields: { [key: string]: string } = {}

    let fieldMatch
    // 各フィールドを抽出
    while ((fieldMatch = fieldRegex.exec(requestContent)) !== null) {
      const fieldName = fieldMatch[1]
      const fieldValue = fieldMatch[2].trim()
      fields[fieldName] = fieldValue
    }

    results.push(fields)
  }

  return results
}
