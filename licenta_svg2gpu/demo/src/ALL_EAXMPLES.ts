export type TExample = {
    name: string,
    path: string,
} | {
    categoryName: string;
    examples: TExample[]
}

export const ALL_EXAMPLES: TExample[] = [
    {
        categoryName: "SVG2GPU",
        examples: [
            {
                name: "Basic Geometry",
                path: "svg-basic-geometry"
            },
            {
                name: "Path Curves",
                path: "svg-path-curves"
            },
            {
                name: "Transforms + Inheritance",
                path: "svg-transform-inheritance"
            },
            {
                name: "Fill Rules",
                path: "svg-fill-rules"
            },
            {
                name: "Runtime Compile Tests",
                path: "svg-runtime-tests"
            },
            {
                name: "Complex Tiger",
                path: "complex-tiger"
            },
            {
                name: "NYC Map Stress",
                path: "nyc-map-preview"
            },
        ]
    },
]

import type { ComponentType } from "react"
import SvgBasicGeometryPreview from "./examples/svg-basic-geometry/Preview"
import SvgFillRulesPreview from "./examples/svg-fill-rules/Preview"
import SvgPathCurvesPreview from "./examples/svg-path-curves/Preview"
import SvgRuntimeTestsPreview from "./examples/svg-runtime-tests/Preview"
import SvgTransformInheritancePreview from "./examples/svg-transform-inheritance/Preview"
import ComplexTigerPreview from "./examples/svg-tiger/Preview"
import NYCMapPreview from "./examples/svg-map-preview/Preview"

export const EXAMPLE_COMPONENTS: Record<string, ComponentType> = {
    "svg-basic-geometry": SvgBasicGeometryPreview,
    "svg-path-curves": SvgPathCurvesPreview,
    "svg-transform-inheritance": SvgTransformInheritancePreview,
    "svg-fill-rules": SvgFillRulesPreview,
    "svg-runtime-tests": SvgRuntimeTestsPreview,
    "complex-tiger": ComplexTigerPreview,
    "nyc-map-preview": NYCMapPreview
}
