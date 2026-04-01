import type { SVGProps } from 'react';
import React from 'react';

/**
 * Test-only SVG component used to stub SVG imports in Vitest.
 */
const SvgComponent = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;

export default SvgComponent;
