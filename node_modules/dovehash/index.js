var crypto = require('crypto');
// var	crypt3 = require('crypt3');

module.exports = exports = Dovehash;

var DEFAULT_ENCODING = 'base64',
	HASH = {
		PLAIN:           { size: null, salted: false, encoded: false, algorithm: null,     crypt: false  },
		CLEARTEXT:       { size: null, salted: false, encoded: false, algorithm: null,     crypt: false  },
		"PLAIN.HEX":     { size: null, salted: false, encoded: true,  algorithm: null,     crypt: false  },
		"CLEARTEXT.HEX": { size: null, salted: false, encoded: true,  algorithm: null,     crypt: false  },
		MD5:             { size: 16,   salted: false, encoded: true,  algorithm: 'md5',    crypt: '$1$'  },
		SHA:             { size: 20,   salted: false, encoded: true,  algorithm: 'sha1',   crypt: false  },
		SHA1:            { size: 20,   salted: false, encoded: true,  algorithm: 'sha1',   crypt: false  },
		SHA256:          { size: 32,   salted: false, encoded: true,  algorithm: 'sha256', crypt: false  },
		SHA512:          { size: 64,   salted: false, encoded: true,  algorithm: 'sha512', crypt: false  },
		SMD5:            { size: 16,   salted: true,  encoded: true,  algorithm: 'md5',    crypt: false  },
		SSHA:            { size: 20,   salted: true,  encoded: true,  algorithm: 'sha1',   crypt: false  },
		SSHA256:         { size: 32,   salted: true,  encoded: true,  algorithm: 'sha256', crypt: false  },
		SSHA512:         { size: 64,   salted: true,  encoded: true,  algorithm: 'sha512', crypt: false  }
	};

function Dovehash(str) {
	this.encoded = str;
	this.parse();
}
Dovehash.littleEndian = false;
Dovehash.prototype.toString = function() {
	return this.encoded;
};
Dovehash.prototype.inspect = function() {
	return this.toString();
	// return this.scheme + '.' + this.encoding + ' ' + this.pwhash + ' (' + (this.salt ? Dovehash.buffer2int(this.salt) : 'not salted') + ')';
};
Dovehash.prototype.parse = function() {
	if (!this.encoded) { throw new Error("Dovehash: empty password hash"); }

	this.scheme = null;                   // hash name (e.g. SSHA)
	this.salt = null;                     // password salt as hex
	this.encoding = DEFAULT_ENCODING;     // input string encoding (either hex or base64)
	this.pwhash = null;                   // hex-encoded hash of the password (after decoding and stripping of scheme and salt)
	this.hash = this.encoded;             // original input hash (before decoding)

	var ridx, didx;
	// strip scheme from input string to this.scheme (e.g., "SSHA" from "{SSHA}somehashfollows")
	if ((this.encoded.charAt(0) === '{') && ((ridx = this.encoded.indexOf('}')) > 0)) {
		this.scheme = this.encoded.substring(1, ridx).toUpperCase();
		this.hash = this.encoded.substr(ridx + 1);
	}
	if (HASH[this.scheme] && !HASH[this.scheme].encoded) {
		this.encoding = null;
	}
	// if scheme defines some custom encoding, strip this encoding to this.encoding
	if (this.scheme && (didx = this.scheme.indexOf('.')) > 0) {
		this.encoding = this.scheme.substr(didx + 1);
		this.scheme = this.scheme.substr(0, didx);
	}
	this.conf = HASH[this.scheme + '.' + this.encoding] || HASH[this.scheme];
	if (!this.conf) { throw new Error("Dovehash: " + this.scheme + " scheme is currently not supported"); }
	// decode original password hash and strip salt to this.salt if there is any
	this.decode(this.hash);
	// if (this.has_salt(this.scheme) && HASHSIZE[this.scheme]) {
	// 	this.salt =
	// }
};
Dovehash.prototype.decode = function(hash) {
	var buf, e;

	// set this.pwhash and return if input data is not encoded
	if (!this.encoding) {
		this.pwhash = hash;
		return;
	}

	// check for known encoding
	e = this.encoding.toLowerCase();
	if (['b64', 'base64', 'hex'].indexOf(e) < 0) {
		throw new Error("Dovehash: an unknown password encoding '" + e + "' (known are b64, base64 and hex)");
	}

	// normalize input hash: store hex for encoded passwords and clear text for others
	buf = new Buffer(hash, e === 'hex' ? 'hex' : 'base64');
	this.pwhash = this.conf.encoded ? buf.toString('hex') : buf.toString();
	// console.log('decode', this.pwhash);

	// check whether we are using some crypt algorithm
	if (this.conf.crypt && hash.indexOf(this.conf.crypt) === 0) {
		throw new Error("Dovehash: crypt hashes are currently not supported");
		// var rpw = buf.toString().substr(this.conf.crypt.length),
		// 	rsidx = Math.min(rpw.indexOf('$'), 8),
		// 	rsalt = rpw.substr(0, rsidx),
		// 	rhash = rpw.substr(rsidx + 1);
		// this.pwhash = rhash;
		// this.salt = rsalt;
	}
	// console.log('before stripping', e, hash, buf);

	// strip salt if there is any
	if (this.conf.salted) {
		this.pwhash = buf.toString('hex', 0, this.conf.size);
		this.salt = new Buffer(buf.toString('hex', this.conf.size), 'hex');
		// console.log('salted', this.scheme, this.encoding, this.conf.size, this.pwhash, this.salt, this.salt.readUInt32BE(0));
	}
};
Dovehash.prototype.toJSON = function() {
	return {
		input: this.encoded,
		scheme: this.scheme,
		encoding: this.encoding,
		salt: Dovehash.buffer2int(this.salt),
		password: this.pwhash
	};
};
Dovehash.prototype.equals = function(pw) {
	// console.log(this.toJSON());
	if (!this.scheme || !this.conf || !this.conf.algorithm) {
		if (!this.conf || !this.conf.encoded) { return this.pwhash === pw; };
		return this.pwhash === new Buffer(pw).toString(this.encoding.toUpperCase() === "HEX" ? 'hex' : 'base64');
	}
	var hash, digest;
	if (this.conf.crypt) {
		throw new Error("Dovehash: crypt hashes are currently not supported");
		// var x = crypt3(pw, this.salt);
		// console.log('x', pw, this.salt, x, this.pwhash);
	} else {
		hash = crypto.createHash(HASH[this.scheme].algorithm);
		hash.update(pw);
		if (this.salt) {
			hash.update(this.salt);
		}
		digest = hash.digest('hex');
		// console.log('equals', this.conf.algorithm, pw, this.salt, digest, digest === this.pwhash);
		return digest === this.pwhash;
	}
};
Dovehash.prototype.encode = function(pw, enc) {
	return Dovehash.encode(this.scheme, pw, this.salt, enc);
};
Dovehash.prototype.getSalt = function() {
	return Dovehash.buffer2int(this.salt);
};

Dovehash.int2buffer = function(i) {
	if (typeof i === "undefined" || i === null) { return; }
	if (i.constructor === Buffer) { return i; }
	var b = new Buffer(4);
	Dovehash.littleEndian ? b.writeUInt32LE(i, 0) : b.writeUInt32BE(i, 0);
	return b;
};

Dovehash.buffer2int = function(buf) {
	if (typeof buf === "undefined" || buf === null) { return; }
	if (buf.constructor !== Buffer) { return buf; }
	return Dovehash.littleEndian ? buf.readUInt32LE(0) : buf.readUInt32BE(0);
};

Dovehash.getSalt = function(hash) {
	return new Dovehash(hash).getSalt();
};

Dovehash.genSalt = function(conf) {
	var size = conf && conf.saltLength ? conf.saltLength : null,
		salt = Math.round(Math.random() * Math.pow(2, 8 * 4)).toString(),
		buf;
	if (size && salt.length > size) { salt = salt.substr(size); }
	return Dovehash.int2buffer(parseInt(salt, 10));
};

Dovehash.encode = function(scheme, pw, salt, enc) {
	scheme = scheme.toUpperCase();
	// detect password encoding from scheme if enc is not supplied
	if (scheme.indexOf('.') > 0) {
		if (typeof enc === "undefined") {
			enc = scheme.substr(scheme.indexOf('.') + 1);
		}
		scheme = scheme.substr(0, scheme.indexOf('.'));
	}
	// get scheme configuration
	var conf = HASH[scheme + '.' + enc] || HASH[scheme];
	if (!conf) { throw new Error("Dovehash.encode: wrong scheme " + scheme); }
	enc = enc ? enc.toLowerCase() : enc;
	var hex = enc === "hex" ? true : false,                  // hex-encode if true, base64 otherwise
		prefix = hex ? scheme + '.hex' : scheme,             // final scheme name
		hash, len, encoded, buf, hd, s;
	// console.log('conf', conf, enc, hex);

	// either generate new salt or get salt as Buffer
	s = typeof salt === "undefined" ? Dovehash.genSalt(conf) : Dovehash.int2buffer(salt);

	// create a resulting buffer with appropriate size
	len = (conf.size || pw.length) + (conf.salted && s ? s.length : 0);
	buf = new Buffer(len);

	// if hashing algorithm is defined for current scheme, use it to encode password
	if (conf.algorithm) {
		hash = crypto.createHash(conf.algorithm);
		hash.update(pw);
		if (conf.salted) { hash.update(s); }
		// get hash as buffer
		hd = new Buffer(hash.digest('base64'), 'base64');
		// console.log('encode', len, buf.length, s.length, hd.length);
		// copy hash to resulting buffer
		hd.copy(buf);
		// copy salt to resulting buffer after hash if needed
		if (conf.salted) {
			s.copy(buf, hd.length);
		}
	} else {
		// simply write password to resulting buffer
		buf.write(pw);
	}

	// create hash string in Dovecot style
	encoded = '{' + prefix + '}';
	if (conf.encoded) {
		encoded += buf.toString(hex ? 'hex' : 'base64');
	} else {
		encoded += buf.toString();
	}
	// console.log('encoded', encoded);
	return new Dovehash(encoded);
};

Dovehash.equal = function(hash, pw) {
	try {
		return new Dovehash(hash).equals(pw);
	} catch(e) {
		return false;
	}
};
