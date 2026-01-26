const crypto = require("crypto")

const algorithm = "aes-256-gcm"


const secretKey = crypto
  .createHash("sha256")
  .update(process.env.PHRASE_SECRET_KEY || "fallback-dev-secret")
  .digest()

function encrypt(text) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: tag.toString("hex"),
  }
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encrypted.iv, "hex")
  )

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"))

  let decrypted = decipher.update(encrypted.content, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

module.exports = { encrypt, decrypt }
