"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeRendererProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = "CODE128",
  width = 1.6,
  height = 45,
  displayValue = true,
  fontSize = 12,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          margin: 4,
          font: "monospace",
          textMargin: 2,
        });
      } catch (err) {
        console.error("Barcode generation error for value:", value, err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize]);

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1 rounded border border-slate-200 ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
};

export default BarcodeRenderer;
