exports.isFunction= function (obj) {
	return toString.call(obj) == '[object Function]';
}