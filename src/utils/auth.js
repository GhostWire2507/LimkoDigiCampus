// Lightweight SHA-256 implementation used for hashing local/demo passwords.
function sha256(ascii) {
  const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (let multiple = 0; multiple < 313; multiple += candidate) {
        isComposite[multiple] = candidate;
      }

      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }

  const normalized = `${ascii}\u0080`;

  for (let index = 0; index < normalized.length; index += 1) {
    const characterCode = normalized.charCodeAt(index);
    words[index >> 2] |= characterCode << (((3 - index) % 4) * 8);
  }

  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = asciiBitLength;

  for (let index = 0; index < words.length; ) {
    const chunk = words.slice(index, (index += 16));
    const previousHash = hash.slice(0);

    for (let offset = 0; offset < 64; offset += 1) {
      const word15 = chunk[offset - 15];
      const word2 = chunk[offset - 2];
      const schedule =
        offset < 16
          ? chunk[offset]
          : (((rightRotate(word15, 7) ^ rightRotate(word15, 18) ^ (word15 >>> 3)) +
              chunk[offset - 7] +
              (rightRotate(word2, 17) ^ rightRotate(word2, 19) ^ (word2 >>> 10)) +
              chunk[offset - 16]) |
              0);

      chunk[offset] = schedule;

      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) +
          k[offset] +
          schedule) |
        0;
      const temp2 =
        ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
          ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) |
        0;

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (let offset = 0; offset < 8; offset += 1) {
      hash[offset] = (hash[offset] + previousHash[offset]) | 0;
    }
  }

  let result = "";

  for (let index = 0; index < 8; index += 1) {
    for (let offset = 3; offset >= 0; offset -= 1) {
      const byte = (hash[index] >> (offset * 8)) & 255;
      result += (byte < 16 ? "0" : "") + byte.toString(16);
    }
  }

  return result;
}

// Adds a simple app-specific prefix before hashing user passwords.
export function hashPassword(password) {
  return sha256(`limko::${String(password || "").trim()}`);
}

// Lets the app quickly tell whether a stored value already looks hashed.
export function isPasswordHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

// Compares a plain password with the stored hash.
export function verifyPassword(password, hash) {
  if (!hash) {
    return false;
  }

  return hashPassword(password) === hash;
}
