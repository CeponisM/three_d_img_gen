export const fragmentShaderSrc = `
precision highp float;

uniform sampler2D image;
uniform sampler2D depth;
uniform vec2 iResolution;
uniform float iTime;

uniform float iDepthHeight;
uniform float iDepthFocus;
uniform float iDepthZoom;
uniform float iDepthIsometric;
uniform float iDepthDolly;
uniform vec2 iDepthCenter;
uniform vec2 iDepthOffset;
uniform float iDepthStatic;
uniform vec2 iDepthOrigin;
uniform float iDepthInvert;
uniform float iDepthMirror;
uniform float iQuality;
uniform float iDofEnable;
uniform float iDofIntensity;
uniform float iDofStart;
uniform float iDofEnd;
uniform float iDofExponent;
uniform float iDofQuality;
uniform float iDofDirections;
uniform float iVignetteEnable;
uniform float iVignetteIntensity;
uniform float iVignetteDecay;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

struct Camera {
    vec3 position;
    vec3 origin;
    vec2 gluv;
    float isometric;
    float dolly;
    float zoom;
    vec3 plane_point;
    bool out_of_bounds;
};

Camera iInitCamera(vec2 uv) {
    Camera camera;
    camera.gluv = uv;
    camera.position = vec3(0.0, 0.0, 0.0);
    camera.origin = vec3(0.0, 0.0, 1.0);
    camera.isometric = 0.0;
    camera.dolly = 0.0;
    camera.zoom = 1.0;
    camera.plane_point = vec3(0.0, 0.0, 1.0);
    camera.out_of_bounds = false;
    return camera;
}

Camera iProjectCamera(Camera camera) {
    // Implement camera projection logic here if needed
    return camera;
}

vec4 gtexture(sampler2D tex, vec2 uv, float mirror) {
    if (mirror > 0.5) {
        uv = abs(fract(uv) * 2.0 - 1.0);
    }
    return texture2D(tex, uv);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    Camera iCamera = iInitCamera(uv);

    float iDepthDistance = 1.0 + mix(0.0, iDepthHeight, iDepthFocus);

    iCamera.position.xy += iDepthOffset;
    iCamera.isometric += iDepthIsometric;
    iCamera.dolly += iDepthDolly;
    iCamera.zoom += (iDepthZoom - 1.0) + (iDepthDistance - 1.0);
    iCamera.plane_point = vec3(0.0, 0.0, iDepthDistance);
    iCamera = iProjectCamera(iCamera);

    if (iCamera.out_of_bounds) {
        gl_FragColor = vec4(vec3(0.2), 1.0);
        return;
    }

    vec2 lambda = (iCamera.gluv - iCamera.position.xy) + iDepthCenter;
    vec2 sigma = iCamera.gluv - iCamera.position.xy * (1.0 + iDepthStatic * iDepthHeight / iDepthDistance) + iDepthCenter;
    vec2 displacement = (iCamera.origin.xy - lambda) + iDepthOrigin;
    vec2 walk = normalize(displacement);

    float theta = atan(length(displacement), abs(iDepthDistance - iCamera.origin.z));
    float tan_theta = tan(theta);

    float delta = tan_theta * (iDepthDistance - iCamera.origin.z - iDepthHeight);
    float alpha = tan_theta * (iDepthDistance - iCamera.origin.z);
    float beta = alpha - delta;

    vec2 point_gluv = sigma;
    float point_height = 0.0;

    {
        float max_dimension = max(iResolution.x, iResolution.y);
        float max_quality = max_dimension * 0.50;
        float min_quality = max_dimension * 0.05;
        float quality = mix(min_quality, max_quality, iQuality);

        float probe = mix(50.0, 100.0, iQuality);
        bool swipe = true;
        float i = 1.0;

        for (int stage = 0; stage < 2; stage++) {
            bool FORWARD = (stage == 0);
            bool BACKWARD = (stage == 1);

            for (int i = 0; i < 100; i++) {
                if (FORWARD) {
                    if (i < 0.0) {
                        swipe = false;
                        break;
                    }
                } else if (1.0 < i) {
                    break;
                }

                i -= FORWARD ? (1.0 / probe) : (-1.0 / quality);

                vec2 sample = sigma + (i * beta * walk);

                float true_height = gtexture(depth, sample, iDepthMirror).r;
                float depth_height = iDepthHeight * mix(true_height, 1.0 - true_height, iDepthInvert);
                float walk_height = (i * beta) / tan_theta;

                if (depth_height >= walk_height) {
                    if (FORWARD) break;
                } else if (BACKWARD) {
                    point_height = true_height;
                    point_gluv = sample;
                    break;
                }
                if (condition_to_break) {
                    break;
                }
            }
        }
    }

    vec4 fragColor = gtexture(image, point_gluv, iDepthMirror);

    if (iDofEnable > 0.5) {
        float intensity = iDofIntensity * pow(smoothstep(iDofStart, iDofEnd, 1.0 - point_height), iDofExponent);
        vec4 color = fragColor;

        for (int i = 0; i < int(iDofDirections); i++) {
            float angle = float(i) * (TAU / iDofDirections);
            for (float walk = 1.0 / iDofQuality; walk <= 1.001; walk += 1.0 / iDofQuality) {
                vec2 disp = vec2(cos(angle), sin(angle)) * walk * intensity;
                color += gtexture(image, point_gluv + disp, iDepthMirror);
            }
        }
        fragColor = color / (iDofDirections * iDofQuality);
    }

    if (iVignetteEnable > 0.5) {
        vec2 away = uv * (1.0 - uv.yx);
        float linear = iVignetteIntensity * (away.x * away.y);
        fragColor.rgb *= clamp(pow(linear, iVignetteDecay), 0.0, 1.0);
    }

    gl_FragColor = fragColor;
}
`;