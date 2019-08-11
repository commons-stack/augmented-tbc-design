import React, { useState, useEffect } from "react";
import { InputFieldInterface, CurveParamsInterface } from "./types";
import InputParamBig from "./InputParamBig";
import { parameterDescriptions } from "./parametersDescriptions";

export default function SimulationInputParams({
  curveParams,
  setCurveParams
}: {
  curveParams: CurveParamsInterface;
  setCurveParams(newCurveParams: any): void;
}) {
  const [d0, setD0] = useState(3e6); // Initial raise, d0 (DAI)

  useEffect(() => {
    setD0(curveParams.d0);
  }, [curveParams]);

  function setParentCurveParams() {
    setCurveParams((params: CurveParamsInterface) => ({
      ...params,
      d0
    }));
  }

  const inputFields: InputFieldInterface[] = [
    {
      label: `${parameterDescriptions.d0.name}`,
      description: parameterDescriptions.d0.text,
      value: d0,
      setter: setD0,
      min: 0.1e6,
      max: 10e6,
      step: 0.1e6,
      suffix: "M",
      format: (n: number) => `$${+(n * 1e-6).toFixed(1)}M`,
      toText: (n: number) => String(+(n * 1e-6).toFixed(1)),
      toNum: (n: string) => Math.floor(parseFloat(n) * 1e6)
    }
  ];

  return (
    <InputParamBig
      inputFields={inputFields}
      onChangeCommited={setParentCurveParams}
    />
  );
}
