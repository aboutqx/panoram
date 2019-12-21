
varying vec3 texCoord;
uniform float v_progress;
uniform float strength;

void main() {
    texCoord = position;
    vec3 t = position;
    t.z += v_progress*strength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(-t.x,t.y,t.z, 1.0 );
    
}