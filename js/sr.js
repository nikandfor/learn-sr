
let cyr2lat = new Map([
	["а", "a"],
	["б", "b"],
	["в", "v"],
	["г", "g"],
	["д", "d"],
	["ђ", "đ"],
	["е", "e"],
	["ж", "ž"],
	["з", "z"],
	["и", "i"],
	["ј", "j"],
	["к", "k"],
	["л", "l"],
	["љ", "lj"],
	["м", "m"],
	["н", "n"],
	["њ", "nj"],
	["о", "o"],
	["п", "p"],
	["р", "r"],
	["с", "s"],
	["т", "t"],
	["ћ", "ć"],
	["у", "u"],
	["ф", "f"],
	["х", "h"],
	["ц", "c"],
	["ч", "č"],
	["џ", "dž"],
	["ш", "š"],
])

const Person = Object.freeze({
	First: Symbol("first"),
	Second: Symbol("second"),
	Third: Symbol("third"),
})

const GrammaticalNumber = Object.freeze({
	Singular: Symbol("singular"),
	Plural: Symbol("plural"),
})

const Gender = Object.freeze({
	Masculine: Symbol("masculine"),
	Feminine: Symbol("feminine"),
	Neuter: Symbol("neuter"),
})

const NumberType = Object.freeze({
	Cardinal: Symbol("cardinal"),
	Ordinal: Symbol("ordinal"),
})

const NumberTextFormat = Object.freeze({
	Text: Symbol("text"),
	HTML: Symbol("html"),
})

const Number = function() {
	const wrap = (t, cl, hh) => hh? `<span class="${cl}">${t}</span>`: t
	const lost = t => wrap(t, "lost", true)
	const repl = t => wrap(t, "replaced", true)

	const names = ["nula", "jedan", "dva", "tri", "četiri", "pet", "šest", "sedam", "osam", "devet", "deset"]
	const bases = {1: "", 10: "deset", 100: "sto", 1000: "hiljada"}
	const ordinals = ["nulti", "prvi", "drugi", "treći", "četvrti", "peti", "šesti", "sedmi", "osmi", "deveti", "deseti"]
	const obases = {1: "", 10: "deseti", 100: "stoti", 1000: "hiljadati"}

	const exc = new Map()

	exc.set("11", {
		[NumberTextFormat.Text]: "jeda",
		[NumberTextFormat.HTML]: "jeda" + lost("n"),
	})
	exc.set("14", {
		[NumberTextFormat.Text]: "četr",
		[NumberTextFormat.HTML]: "čet" + lost("i") + "r" + lost("i"),
	})
	exc.set("40", exc.get(14))
	exc.set("50", {
		[NumberTextFormat.Text]: "pe",
		[NumberTextFormat.HTML]: "pe" + lost("t"),
	})
	exc.set("16", {
		[NumberTextFormat.Text]: "šes",
		[NumberTextFormat.HTML]: "šes" + lost("t"),
	})
	exc.set("60", {
		[NumberTextFormat.Text]: "šez",
		[NumberTextFormat.HTML]: "še" + repl("z"),
	})
	exc.set("90", {
		[NumberTextFormat.Text]: "deve",
		[NumberTextFormat.HTML]: "deve" + lost("t"),
	})

	exc.set("200", {
		[NumberTextFormat.Text]: "dve",
		[NumberTextFormat.HTML]: "dv" + repl("e"),
	})

	const baseExc = new Map()

	function c(v, cfg = {}) {
		if ((typeof parseInt(v)) != "number" || isNaN(v) || !isFinite(v)) return "wtf: " + v

		const tf = cfg.NumberTextFormat || NumberTextFormat.Text
		const hh = tf == NumberTextFormat.HTML
		const nt = cfg.NumberType || NumberType.Cardinal
		const ord = nt == NumberType.Ordinal

		const html = (c, o) => `<span class="card">${c}</span><span class="ord">${o}</span>`

		const name = (v, def) => {
			v = v + ""

			let e = exc.get(v)
			if (e) {
				return e[tf]
			}

			if (hh && v < 10) {
				return html(names[def], ordinals[def])
			}

			return ord? ordinals[def]: names[def]
		}

		const baseName = (b, def) => {
			const bn = ord => {
				if (!ord && (b == 200 || b == 300)) return "st" + (hh? repl("a"):"")

				return ord? obases[def]: bases[def]
			}

			return hh? html(bn(false), bn(true)): bn(ord)
		}

		const base = t => wrap(t, "base-broj", hh)
		const suff = t => wrap(t, "suffix", hh)

		if (v < 0) {
			return "minus " + c(-v, cfg)
		}
		if (v < 10) {
			return base(name(v, v))
		}
		if (v > 10 && v <= 19) {
			return base(name(v, v - 10)) + suff("naest" + (hh? html("", "i"): ord? "i": ""))
		}

		for (const mod of [1000, 100, 10]) {
			if (v < mod) {
				continue
			}

			let div = Math.trunc(v / mod)
			let rem = v % mod

			return (div == 1? "": base(name(v, div))) +
				suff(baseName(div * mod, mod)) +
				(rem == 0? "": " " + c(rem, cfg))
		}

		return base("over 9000")
	}

	return class {
		constructor(val = 0) {
			this.value = val
		}

		toString(cfg = {}) {
			return c(this.value, cfg)
		}
	}
}()
