var assert = require('assert'),
	Dovehash = require('./index');

Dovehash.littleEndian = false;

var password = "abcdef",
	wrongPassword = "Abcdef",
	data = {
		"CLEARTEXT": "{CLEARTEXT}abcdef",
		"CLEARTEXT.HEX": "{CLEARTEXT.hex}616263646566",
		"MD5": "{MD5}$1$y4ZPtr6S$zQzv03vCmN6sLisvn0TSE1",
		"MD5.HEX": "{MD5.hex}24312437584c39756f7233242e4838544d6c42683035546a744d2e2e643767337531",
		"PLAIN": "{PLAIN}abcdef",
		"PLAIN.HEX": "{PLAIN.hex}616263646566",
		"SHA": "{SHA}H4rBDyPFtbwRZ72oS4M+XAV6d9I=",
		"SHA.HEX": "{SHA.hex}1f8ac10f23c5b5bc1167bda84b833e5c057a77d2",
		"SHA1": "{SHA1}H4rBDyPFtbwRZ72oS4M+XAV6d9I=",
		"SHA1.HEX": "{SHA1.hex}1f8ac10f23c5b5bc1167bda84b833e5c057a77d2",
		"SHA256": "{SHA256}vvV+x/U6bUC+tkCngKY5yDvCmsipgW8fxsXG3Nk8RyE=",
		"SHA256.HEX": "{SHA256.hex}bef57ec7f53a6d40beb640a780a639c83bc29ac8a9816f1fc6c5c6dcd93c4721",
		"SMD5": "{SMD5}LHP35YJionafcv2qprLa4OhLo2k=",
		"SMD5.HEX": "{SMD5.hex}fa87931322d2430ea41a5cc984bd757c50ae3552",
		"SSHA": "{SSHA}PTggDCOUPEVj5h7bZjhxfKWQBpey47nF", // orig
		"SSHA.HEX": "{SSHA.hex}1bc74958f014572d9acd6242c23ca173b0cbe9717441971e", // orig
		"SSHA256": "{SSHA256}GijHt7asXeV0hUn5rVy2gM/aEWAKnb3FWvz+VKA55hS6wZ5k",
		"SSHA256.HEX": "{SSHA256.hex}1394de2e486bc75156e8109bb2ed347e4dc0a1af0f76e92b59a65e650495b73187c66c9c"
	},
	bad = {
		encoding: "{SSHA.junk}1bc74958f014572d9acd6242c23ca173b0cbe9717441971e",
		unknown: "{UNKNOWN}junk"
	},
	salt = {
		SMD5: 3897271145,
		SSHA: 3001268677,
		SSHA256: 3133251172
	};

describe('Dovehash should validate password encoded with', function() {
	it('CLEARTEXT scheme',     function() { assert.equal(Dovehash.equal(data['CLEARTEXT'],     password), true); });
	it('CLEARTEXT.HEX scheme', function() { assert.equal(Dovehash.equal(data['CLEARTEXT.HEX'], password), true); });
	// it('MD5 scheme',           function() { assert.equal(Dovehash.equal(data['MD5'],           password), true); });
	// it('MD5.HEX scheme',       function() { assert.equal(Dovehash.equal(data['MD5.HEX'],       password), true); });
	it('PLAIN scheme',         function() { assert.equal(Dovehash.equal(data['PLAIN'],         password), true); });
	it('PLAIN.HEX scheme',     function() { assert.equal(Dovehash.equal(data['PLAIN.HEX'],     password), true); });
	it('SHA scheme',           function() { assert.equal(Dovehash.equal(data['SHA'],           password), true); });
	it('SHA.HEX scheme',       function() { assert.equal(Dovehash.equal(data['SHA.HEX'],       password), true); });
	it('SHA1 scheme',          function() { assert.equal(Dovehash.equal(data['SHA1'],          password), true); });
	it('SHA1.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SHA1.HEX'],      password), true); });
	it('SHA256 scheme',        function() { assert.equal(Dovehash.equal(data['SHA256'],        password), true); });
	it('SHA256.HEX scheme',    function() { assert.equal(Dovehash.equal(data['SHA256.HEX'],    password), true); });
	it('SMD5 scheme',          function() { assert.equal(Dovehash.equal(data['SMD5'],          password), true); });
	it('SMD5.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SMD5.HEX'],      password), true); });
	it('SSHA scheme',          function() { assert.equal(Dovehash.equal(data['SSHA'],          password), true); });
	it('SSHA.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SSHA.HEX'],      password), true); });
	it('SSHA256 scheme',       function() { assert.equal(Dovehash.equal(data['SSHA256'],       password), true); });
	it('SSHA256.HEX scheme',   function() { assert.equal(Dovehash.equal(data['SSHA256.HEX'],   password), true); });
});
describe('Dovehash should encode password to', function() {
	it('CLEARTEXT scheme',     function() { assert.equal(Dovehash.encode('CLEARTEXT',     'abcdef', Dovehash.getSalt(data['CLEARTEXT'])),     data['CLEARTEXT']);     });
	it('CLEARTEXT.HEX scheme', function() { assert.equal(Dovehash.encode('CLEARTEXT.HEX', 'abcdef', Dovehash.getSalt(data['CLEARTEXT.HEX'])), data['CLEARTEXT.HEX']); });
	it('PLAIN scheme',         function() { assert.equal(Dovehash.encode('PLAIN',         'abcdef', Dovehash.getSalt(data['PLAIN'])),         data['PLAIN']);         });
	it('PLAIN.HEX scheme',     function() { assert.equal(Dovehash.encode('PLAIN.HEX',     'abcdef', Dovehash.getSalt(data['PLAIN.HEX'])),     data['PLAIN.HEX']);     });
	it('SHA scheme',           function() { assert.equal(Dovehash.encode('SHA',           'abcdef', Dovehash.getSalt(data['SHA'])),           data['SHA']);           });
	it('SHA.HEX scheme',       function() { assert.equal(Dovehash.encode('SHA.HEX',       'abcdef', Dovehash.getSalt(data['SHA.HEX'])),       data['SHA.HEX']);       });
	it('SHA1 scheme',          function() { assert.equal(Dovehash.encode('SHA1',          'abcdef', Dovehash.getSalt(data['SHA1'])),          data['SHA1']);          });
	it('SHA1.HEX scheme',      function() { assert.equal(Dovehash.encode('SHA1.HEX',      'abcdef', Dovehash.getSalt(data['SHA1.HEX'])),      data['SHA1.HEX']);      });
	it('SHA256 scheme',        function() { assert.equal(Dovehash.encode('SHA256',        'abcdef', Dovehash.getSalt(data['SHA256'])),        data['SHA256']);        });
	it('SHA256.HEX scheme',    function() { assert.equal(Dovehash.encode('SHA256.HEX',    'abcdef', Dovehash.getSalt(data['SHA256.HEX'])),    data['SHA256.HEX']);    });
	it('SMD5 scheme',          function() { assert.equal(Dovehash.encode('SMD5',          'abcdef', Dovehash.getSalt(data['SMD5'])),          data['SMD5']);          });
	it('SMD5.HEX scheme',      function() { assert.equal(Dovehash.encode('SMD5.HEX',      'abcdef', Dovehash.getSalt(data['SMD5.HEX'])),      data['SMD5.HEX']);      });
	it('SSHA scheme',          function() { assert.equal(Dovehash.encode('SSHA',          'abcdef', Dovehash.getSalt(data['SSHA'])),          data['SSHA']);          });
	it('SSHA.HEX scheme',      function() { assert.equal(Dovehash.encode('SSHA.HEX',      'abcdef', Dovehash.getSalt(data['SSHA.HEX'])),      data['SSHA.HEX']);      });
	it('SSHA256 scheme',       function() { assert.equal(Dovehash.encode('SSHA256',       'abcdef', Dovehash.getSalt(data['SSHA256'])),       data['SSHA256']);       });
	it('SSHA256.HEX scheme',   function() { assert.equal(Dovehash.encode('SSHA256.HEX',   'abcdef', Dovehash.getSalt(data['SSHA256.HEX'])),   data['SSHA256.HEX']);   });
//3001268677
});
describe('Dovehash should encode password w/o salt to', function() {
	it('CLEARTEXT scheme',     function() { assert.equal(Dovehash.encode('CLEARTEXT',     password).equals(password), true);  });
	it('CLEARTEXT.HEX scheme', function() { assert.equal(Dovehash.encode('CLEARTEXT.HEX', password).equals(password), true);  });
	it('PLAIN scheme',         function() { assert.equal(Dovehash.encode('PLAIN',         password).equals(password), true);  });
	it('PLAIN.HEX scheme',     function() { assert.equal(Dovehash.encode('PLAIN.HEX',     password).equals(password), true);  });
	it('SHA scheme',           function() { assert.equal(Dovehash.encode('SHA',           password).equals(password), true);  });
	it('SHA.HEX scheme',       function() { assert.equal(Dovehash.encode('SHA.HEX',       password).equals(password), true);  });
	it('SHA1 scheme',          function() { assert.equal(Dovehash.encode('SHA1',          password).equals(password), true);  });
	it('SHA1.HEX scheme',      function() { assert.equal(Dovehash.encode('SHA1.HEX',      password).equals(password), true);  });
	it('SHA256 scheme',        function() { assert.equal(Dovehash.encode('SHA256',        password).equals(password), true);  });
	it('SHA256.HEX scheme',    function() { assert.equal(Dovehash.encode('SHA256.HEX',    password).equals(password), true);  });
	it('SMD5 scheme',          function() { assert.equal(Dovehash.encode('SMD5',          password).equals(password), true);  });
	it('SMD5.HEX scheme',      function() { assert.equal(Dovehash.encode('SMD5.HEX',      password).equals(password), true);  });
	it('SSHA scheme',          function() { assert.equal(Dovehash.encode('SSHA',          password).equals(password), true);  });
	it('SSHA.HEX scheme',      function() { assert.equal(Dovehash.encode('SSHA.HEX',      password).equals(password), true);  });
	it('SSHA256 scheme',       function() { assert.equal(Dovehash.encode('SSHA256',       password).equals(password), true);  });
	it('SSHA256.HEX scheme',   function() { assert.equal(Dovehash.encode('SSHA256.HEX',   password).equals(password), true);  });
});
describe('Dovehash should NOT validate wrong password encoded with', function() {
	it('CLEARTEXT scheme',     function() { assert.equal(Dovehash.equal(data['CLEARTEXT'],     wrongPassword), false); });
	it('CLEARTEXT.HEX scheme', function() { assert.equal(Dovehash.equal(data['CLEARTEXT.HEX'], wrongPassword), false); });
	it('PLAIN scheme',         function() { assert.equal(Dovehash.equal(data['PLAIN'],         wrongPassword), false); });
	it('PLAIN.HEX scheme',     function() { assert.equal(Dovehash.equal(data['PLAIN.HEX'],     wrongPassword), false); });
	it('SHA scheme',           function() { assert.equal(Dovehash.equal(data['SHA'],           wrongPassword), false); });
	it('SHA.HEX scheme',       function() { assert.equal(Dovehash.equal(data['SHA.HEX'],       wrongPassword), false); });
	it('SHA1 scheme',          function() { assert.equal(Dovehash.equal(data['SHA1'],          wrongPassword), false); });
	it('SHA1.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SHA1.HEX'],      wrongPassword), false); });
	it('SHA256 scheme',        function() { assert.equal(Dovehash.equal(data['SHA256'],        wrongPassword), false); });
	it('SHA256.HEX scheme',    function() { assert.equal(Dovehash.equal(data['SHA256.HEX'],    wrongPassword), false); });
	it('SMD5 scheme',          function() { assert.equal(Dovehash.equal(data['SMD5'],          wrongPassword), false); });
	it('SMD5.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SMD5.HEX'],      wrongPassword), false); });
	it('SSHA scheme',          function() { assert.equal(Dovehash.equal(data['SSHA'],          wrongPassword), false); });
	it('SSHA.HEX scheme',      function() { assert.equal(Dovehash.equal(data['SSHA.HEX'],      wrongPassword), false); });
	it('SSHA256 scheme',       function() { assert.equal(Dovehash.equal(data['SSHA256'],       wrongPassword), false); });
	it('SSHA256.HEX scheme',   function() { assert.equal(Dovehash.equal(data['SSHA256.HEX'],   wrongPassword), false); });
});
describe('Dovehash should handle', function() {
	it('bad encoding scheme throwning an exception', function() {
		assert.throws(function() { new Dovehash(bad.encoding); }, /unknown password encoding/);
	});
	it('unsupported schemes throwning an exception', function() {
		assert.throws(function() { new Dovehash(bad.unknown); }, /scheme is currently not supported/);
	});
	it('crypt schemes as unsupported', function() {
		assert.throws(function() { new Dovehash(data.MD5); }, /crypt hashes are currently not supported/);
	});
	it('empty password hashes throwning an exception', function() {
		assert.throws(function() { new Dovehash(); }, /empty password hash/);
	});
});
describe('Dovehash should return', function() {
	it('JSON describing the hash', function() {
		assert.deepEqual(new Dovehash(data.SSHA).toJSON(), {
			input: "{SSHA}PTggDCOUPEVj5h7bZjhxfKWQBpey47nF",
			scheme: "SSHA",
			encoding: "base64",
			password: "3d38200c23943c4563e61edb6638717ca5900697",
			salt: "3001268677"
		});
	});
	it('two different hashes for same password encoded with automatic salt generation', function() {
		assert.notEqual(
			Dovehash.encode('SSHA', password).toString(),
			Dovehash.encode('SSHA', password).toString()
		);
	});
	it('integer salt for SMD5 hashed password',       function() { assert.equal(new Dovehash(data.SMD5          ).getSalt(), salt.SMD5          ); });
	it('integer salt for SSHA hashed password',       function() { assert.equal(new Dovehash(data.SSHA          ).getSalt(), salt.SSHA          ); });
	it('integer salt for SSHA256 hashed password',    function() { assert.equal(new Dovehash(data.SSHA256       ).getSalt(), salt.SSHA256       ); });
});


		// "CRAM-MD5": "{CRAM-MD5}991c7f952639e48ce665db7e81082b3676509882b75ad0215436cb760cddf8d3",
		// "CRYPT": "{CRYPT}pPiGvsW.9wHbI",
		// "HMAC-MD5": "{HMAC-MD5}991c7f952639e48ce665db7e81082b3676509882b75ad0215436cb760cddf8d3",
		// "LANMAN": "{LANMAN}13d855fc4841c7b1aad3b435b51404ee",
		// "LDAP-MD5": "{LDAP-MD5}6AtQFwmJUPxYqtg8jBSXjg==",
		// "MD5-CRYPT": "{MD5-CRYPT}$1$hTRmTVlX$pqmggxV.VL9T7VNOOlusP/",
		// "NTLM": "{NTLM}b5fe2db507cc5ac540493d48fbd5fe33",
		// "OTP": "{OTP}sha1 1024 41a93f60e1b20fb9 2a3e5c957c404c7b",
		// "PLAIN-MD4": "{PLAIN-MD4}804e7f1c2586e50b49ac65db5b645131",
		// "PLAIN-MD5": "{PLAIN-MD5}e80b5017098950fc58aad83c8c14978e",
		// "RPA": "{RPA}a0e417ef9b230147a9294f7ca7fb4eac"
		// "SKEY": "{SKEY}md4 1024 4f5a3372aeb9e277 e9fb4416f20dbac7",
		// "CRYPT.HEX": "{CRYPT.HEX}437a497771585541386e426236",
		// MD5-CRYPT {MD5-CRYPT.HEX}24312467384b545a6d5257244348523134556e794e4f6354324e6857676c396d3531
		// CRAM-MD5 {CRAM-MD5.HEX}991c7f952639e48ce665db7e81082b3676509882b75ad0215436cb760cddf8d3
		// HMAC-MD5 {HMAC-MD5.HEX}991c7f952639e48ce665db7e81082b3676509882b75ad0215436cb760cddf8d3
		// PLAIN-MD4 {PLAIN-MD4.HEX}804e7f1c2586e50b49ac65db5b645131
		// PLAIN-MD5 {PLAIN-MD5.HEX}e80b5017098950fc58aad83c8c14978e
		// LDAP-MD5 {LDAP-MD5.HEX}e80b5017098950fc58aad83c8c14978e
		// LANMAN {LANMAN.HEX}13d855fc4841c7b1aad3b435b51404ee
		// NTLM {NTLM.HEX}b5fe2db507cc5ac540493d48fbd5fe33
		// OTP {OTP.HEX}73686131203130323420326531396137643231656564383230362031356631336436316130306662646332
		// SKEY {SKEY.HEX}6d6434203130323420363637643231646330653866386239642065363462376333376133343366633164
