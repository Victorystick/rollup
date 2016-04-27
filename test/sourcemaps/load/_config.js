var MagicString = require( 'magic-string' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	solo: true,
	description: 'preserves sourcemap chains when loading',
	options: {
		format: 'es6',
		plugins: [
			{
				load: function ( id ) {
					var s = new MagicString( 'export const a = 42;', {
						filename: id
					});
					s.prepend( 'console.warn("Using a beta release!");\n\n' );

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( '42' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		// assert.ok( /main/.test( originalLoc.source ) );
		assert.equal( originalLoc.line, 3 );
		assert.equal( originalLoc.column, 11 );

		generatedLoc = getLocation( code, code.indexOf( 'warn' ) );
		originalLoc = smc.originalPositionFor( generatedLoc );

		// assert.ok( /main/.test( originalLoc.source ) );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 8 );
	}
};
