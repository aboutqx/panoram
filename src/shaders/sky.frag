uniform vec2 u_resolution;
uniform float u_time;
uniform samplerCube tcube;
uniform samplerCube scube;
uniform float progress;
varying vec3 texCoord;


void main() {
	vec4 tcolor = textureCube(tcube, texCoord);
	vec4 color;
	if(progress == -1.) {
		color = tcolor;
	} else {
		color = mix( textureCube(scube, texCoord),tcolor, progress);
	}
	gl_FragColor = color;
}