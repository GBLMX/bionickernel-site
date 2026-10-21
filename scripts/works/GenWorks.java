import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import vsr.E3;
import vsr.Multivector;
import vsr.P3;

/**
 * Generates the static SVG works in public/assets/works/ with versor-java.
 *
 * <p>Compile and run with scripts/works/generate.sh. The math is done by
 * vsr.P3 / vsr.E3; this class only projects and draws.
 */
public final class GenWorks {
    private static final double W = 1000;
    private static final double H = 640;

    public static void main(String[] args) throws IOException {
        Path out = Path.of(args.length > 0 ? args[0] : "public/assets/works");
        Files.createDirectories(out);
        Files.writeString(out.resolve("motor-cube.svg"), motorCube());
        Files.writeString(out.resolve("rotor-field.svg"), rotorField());
        System.out.println("wrote " + out.resolve("motor-cube.svg"));
        System.out.println("wrote " + out.resolve("rotor-field.svg"));
    }

    private static String motorCube() {
        double[][] cube = {
            {-1, -1, -1}, {1, -1, -1}, {1, 1, -1}, {-1, 1, -1},
            {-1, -1, 1}, {1, -1, 1}, {1, 1, 1}, {-1, 1, 1}
        };
        int[][] edges = {
            {0, 1}, {1, 2}, {2, 3}, {3, 0},
            {4, 5}, {5, 6}, {6, 7}, {7, 4},
            {0, 4}, {1, 5}, {2, 6}, {3, 7}
        };

        Multivector identity = Multivector.scalar(P3.SIG, 1);
        Multivector motor = P3.motor(
                P3.rotor(0, 0, 1, Math.toRadians(155)),
                P3.translator(1.15, 0.35, 0.75));

        StringBuilder svg = header(
                "Motor Cube — P3 motor interpolation",
                "A cube carried by a P3 motor from identity to M = T R; nine sampled states.",
                "作品 01 / WORKS", "Motor Cube",
                "P3 · motor interpolation · 12 edges × 9 samples");

        // Motion trail.
        int samples = 9;
        for (int i = 1; i <= samples; i++) {
            double t = i / (double) samples;
            Multivector m = P3.slerp(identity, motor, t);
            String color = lerp("#66c2f2", "#ff8a4c", t);
            double opacity = 0.14 + 0.5 * t;
            for (int[] e : edges) {
                double[] a = project(apply(m, cube[e[0]]));
                double[] b = project(apply(m, cube[e[1]]));
                line(svg, a[0], a[1], b[0], b[1], color, 1.1, opacity, i == samples ? null : null);
            }
        }

        // Initial state.
        for (int[] e : edges) {
            double[] a = project(cube[e[0]]);
            double[] b = project(cube[e[1]]);
            line(svg, a[0], a[1], b[0], b[1], "#66c2f2", 1.2, 0.45, "4 6");
        }

        // Final state: heavier outline and vertices.
        Multivector end = P3.slerp(identity, motor, 1.0);
        for (int[] e : edges) {
            double[] a = project(apply(end, cube[e[0]]));
            double[] b = project(apply(end, cube[e[1]]));
            line(svg, a[0], a[1], b[0], b[1], "#ff8a4c", 2.4, 1.0, null);
        }
        for (double[] v : cube) {
            double[] p = project(apply(end, v));
            svg.append(String.format(Locale.ROOT,
                    "<circle cx=\"%.1f\" cy=\"%.1f\" r=\"3.2\" fill=\"#ffd2b8\"/>%n", p[0], p[1]));
        }

        // Annotations.
        svg.append("""
            <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13">
              <text x="48" y="552" fill="#ff8a4c" letter-spacing="0.08em">M = T R</text>
              <text x="48" y="576" fill="#8b97ad">p' = M p ~M</text>
              <text x="48" y="600" fill="#8b97ad">t = 0.00 → 1.00</text>
            </g>
            <g font-family="system-ui,sans-serif" font-size="12" fill="#8b97ad">
              <text x="952" y="600" text-anchor="end">versor-java · vsr.P3</text>
              <text x="952" y="580" text-anchor="end">Apache-2.0</text>
            </g>
            """);
        return svg.append("</svg>\n").toString();
    }

    private static String rotorField() {
        StringBuilder svg = header(
                "Rotor Field — E3 rotor",
                "A field of vectors on a disk, each rotated by an E3 rotor whose angle follows radius and polar angle.",
                "作品 02 / WORKS", "Rotor Field",
                "E3 · v' = R v ~R · rotor field");

        double cx = 500;
        double cy = 330;
        double radius = 238;

        // Faint polar rings.
        for (double r : new double[] {80, 160, 238}) {
            svg.append(String.format(Locale.ROOT,
                    "<circle cx=\"%.1f\" cy=\"%.1f\" r=\"%.1f\" fill=\"none\" stroke=\"#2b3245\" stroke-width=\"1\" stroke-dasharray=\"2 7\" opacity=\"0.75\"/>%n",
                    cx, cy, r));
        }

        int count = 0;
        for (double y = -radius; y <= radius; y += 20) {
            for (double x = -radius; x <= radius; x += 20) {
                double r = Math.hypot(x, y);
                if (r > radius) continue;
                double phi = Math.atan2(y, x);
                double theta = 1.15 * (r / radius) + 2.4 * phi;
                Multivector rotor = E3.rotor(0, 0, 1, theta);
                double[] v = vectorCoords(E3.rotate(E3.vec(1, 0, 0), rotor));
                double len = 16 + 8 * (1 - r / radius);
                double px = cx + x;
                double py = cy + y;
                double u = (((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);
                String color = u < 0.5
                        ? lerp("#66c2f2", "#b48ead", u * 2)
                        : lerp("#b48ead", "#ff8a4c", (u - 0.5) * 2);
                double opacity = 0.4 + 0.55 * (1 - r / radius);
                line(svg, px, py, px + v[0] * len, py + v[1] * len,
                        color, 1.6, opacity, null);
                count++;
            }
        }

        // Center emphasis.
        Multivector centerRotor = E3.rotor(0, 0, 1, 0);
        double[] c = vectorCoords(E3.rotate(E3.vec(1, 0, 0), centerRotor));
        line(svg, cx, cy, cx + c[0] * 30, cy + c[1] * 30, "#ff8a4c", 3.0, 1.0, null);
        svg.append(String.format(Locale.ROOT,
                "<circle cx=\"%.1f\" cy=\"%.1f\" r=\"4\" fill=\"#ff8a4c\"/>%n", cx, cy));

        svg.append("""
            <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13">
              <text x="48" y="552" fill="#ff8a4c" letter-spacing="0.08em">v' = R v ~R</text>
              <text x="48" y="576" fill="#8b97ad">R = cos(θ/2) − sin(θ/2) e12</text>
              <text x="48" y="600" fill="#8b97ad">θ = 1.15 r + 2.4 φ</text>
            </g>
            <g font-family="system-ui,sans-serif" font-size="12" fill="#8b97ad">
              <text x="952" y="600" text-anchor="end">versor-java · vsr.E3</text>
              <text x="952" y="580" text-anchor="end">%d vectors</text>
            </g>
            """.formatted(count));
        return svg.append("</svg>\n").toString();
    }

    private static StringBuilder header(String title, String desc, String eyebrow, String name, String meta) {
        return new StringBuilder()
                .append("""
                    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640" role="img" aria-labelledby="title desc">
                    <title id="title">%s</title>
                    <desc id="desc">%s</desc>
                    <rect width="1000" height="640" fill="#161925"/>
                    <g stroke="#242a3a" stroke-width="1" opacity="0.55">
                    """.formatted(title, desc))
                .append(grid())
                .append("""
                    </g>
                    <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12" letter-spacing="0.14em">
                      <text x="48" y="64" fill="#66c2f2">%s</text>
                    </g>
                    <g font-family="system-ui,sans-serif">
                      <text x="48" y="112" fill="#e8edf7" font-size="36" font-weight="600" letter-spacing="-0.02em">%s</text>
                      <text x="48" y="142" fill="#8b97ad" font-size="14">%s</text>
                    </g>
                    """.formatted(eyebrow, name, meta));
    }

    private static String grid() {
        StringBuilder g = new StringBuilder();
        for (int x = 40; x < W; x += 40) {
            g.append(String.format(Locale.ROOT, "<line x1=\"%d\" y1=\"0\" x2=\"%d\" y2=\"640\"/>%n", x, x));
        }
        for (int y = 40; y < H; y += 40) {
            g.append(String.format(Locale.ROOT, "<line x1=\"0\" y1=\"%d\" x2=\"1000\" y2=\"%d\"/>%n", y, y));
        }
        return g.toString();
    }

    private static double[] apply(Multivector m, double[] v) {
        return P3.pointCoords(P3.apply(m, P3.point(v[0], v[1], v[2])));
    }

    private static double[] project(double[] p) {
        double yaw = Math.toRadians(-38);
        double pitch = Math.toRadians(26);
        double x = p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw);
        double y = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw);
        double sx = x;
        double sy = y * Math.sin(pitch) - p[2] * Math.cos(pitch);
        double scale = 104;
        return new double[] {500 + sx * scale, 325 + sy * scale};
    }

    private static double[] vectorCoords(Multivector v) {
        // E3.rotate returns an E3 vector; read the e1/e2/e3 coefficients.
        return E3.coords(v);
    }

    private static void line(StringBuilder svg, double x1, double y1, double x2, double y2,
                             String color, double width, double opacity, String dash) {
        svg.append(String.format(Locale.ROOT,
                "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"%s\" stroke-width=\"%.1f\" opacity=\"%.2f\"%s/>%n",
                x1, y1, x2, y2, color, width, opacity,
                dash == null ? "" : " stroke-dasharray=\"" + dash + "\""));
    }

    private static String lerp(String a, String b, double t) {
        int[] ca = rgb(a);
        int[] cb = rgb(b);
        return String.format(Locale.ROOT, "#%02x%02x%02x",
                (int) Math.round(ca[0] + (cb[0] - ca[0]) * t),
                (int) Math.round(ca[1] + (cb[1] - ca[1]) * t),
                (int) Math.round(ca[2] + (cb[2] - ca[2]) * t));
    }

    private static int[] rgb(String hex) {
        return new int[] {
            Integer.parseInt(hex.substring(1, 3), 16),
            Integer.parseInt(hex.substring(3, 5), 16),
            Integer.parseInt(hex.substring(5, 7), 16)
        };
    }
}
