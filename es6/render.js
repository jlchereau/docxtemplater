const { throwUnimplementedTagType } = require("./errors.js");

function moduleRender(part, options) {
	let moduleRendered;
	for (let i = 0, l = options.modules.length; i < l; i++) {
		const module = options.modules[i];
		moduleRendered = module.render(part, options);
		if (moduleRendered) {
			return moduleRendered;
		}
	}
	return false;
}

function render(options) {
	const baseNullGetter = options.baseNullGetter;
	const { compiled, scopeManager } = options;
	options.nullGetter = (part, sm) => {
		return baseNullGetter(part, sm || scopeManager);
	};
	if (!options.prefix) {
		options.prefix = "";
	}
	if (options.index) {
		options.prefix = options.prefix + options.index + "-";
	}
	const errors = [];
	const parts = compiled
		.map(function (part, i) {
			options.index = i;
			const moduleRendered = moduleRender(part, options);
			if (moduleRendered) {
				if (moduleRendered.errors) {
					Array.prototype.push.apply(errors, moduleRendered.errors);
				}
				return moduleRendered;
			}
			if (part.type === "content" || part.type === "tag") {
				return part;
			}
			throwUnimplementedTagType(part, i);
		})
		.reduce(function (parts, { value }) {
			if (value instanceof Array) {
				for (let i = 0, len = value.length; i < len; i++) {
					parts.push(value[i]);
				}
			} else if (value) {
				parts.push(value);
			}
			return parts;
		}, []);
	return { errors, parts };
}

module.exports = render;
