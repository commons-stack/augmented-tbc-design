import React, { useState, useEffect } from "react";
import { InputFieldInterface, CurveParamsInterface } from "./types";
import InputParams from "./InputParams";
import { parameterDescriptions } from "./parametersDescriptions";

export default function CurveDesignInputParams({
  curveParams,
  setCurveParams
}: {
  curveParams: CurveParamsInterface;
  setCurveParams(newCurveParams: any): void;
}) {
  const [theta, setTheta] = useState(0.35); // fraction allocated to reserve (.)
  const [p0, setP0] = useState(0.1); // Hatch sale Price p0 (DAI / token)
  const [p1, setP1] = useState(0.3); // Return factor (.)
  const [wFee, setWFee] = useState(0.05); // friction coefficient (.)
  const [vHalflife, setVHalflife] = useState(52); // friction coefficient (.)

  useEffect(() => {
    setTheta(curveParams.theta);
    setP0(curveParams.p0);
    setP1(curveParams.p1);
    setWFee(curveParams.wFee);
    setVHalflife(curveParams.vHalflife);
  }, [curveParams]);

  function _setP0(newP0: number) {
    setP0(newP0);
    if (p1 < newP0) setP1(newP0);
    else if (p1 > newP0 * maxReturnRate) setP1(newP0 * maxReturnRate);
  }

  function setParentCurveParams() {
    setCurveParams((params: CurveParamsInterface) => ({
      ...params,
      theta,
      p0,
      p1,
      wFee,
      vHalflife
    }));
  }

  const maxReturnRate = 10;

  const inputFields: InputFieldInterface[] = [
    {
      label: parameterDescriptions.theta.name,
      description: parameterDescriptions.theta.text,
      value: theta,
      setter: setTheta,
      min: 0,
      max: 0.9,
      step: 0.01,
      suffix: "%",
      format: (n: number) => `${Math.round(100 * n)}%`,
      toText: (n: number) => String(+(n * 1e2).toFixed(0)),
      toNum: (n: string) => parseFloat(n) * 1e-2
    },
    {
      label: `${parameterDescriptions.p0.name} (DAI/token)`,
      description: parameterDescriptions.p0.text,
      value: p0,
      setter: _setP0,
      min: 0.01,
      max: 1,
      step: 0.01,
      toText: (n: number) => String(+n.toFixed(2)),
      toNum: (n: string) => parseFloat(n),
      format: (n: number) => `$${n}`
    },
    {
      label: `${parameterDescriptions.p1.name} (DAI/token)`,
      description: parameterDescriptions.p1.text,
      value: p1,
      setter: setP1,
      min: p0 || 0.1,
      max: Number((maxReturnRate * p0).toFixed(2)),
      step: 0.01,
      toText: (n: number) => String(+n.toFixed(2)),
      toNum: (n: string) => parseFloat(n),
      format: (n: number) => `$${n}`
    },
    {
      label: parameterDescriptions.wFee.name,
      description: parameterDescriptions.wFee.text,
      value: wFee,
      setter: setWFee,
      min: 0,
      max: 0.1,
      step: 0.001,
      suffix: "%",
      format: (n: number) => `${+(100 * n).toFixed(1)}%`,
      toText: (n: number) => String(+(n * 1e2).toFixed(1)),
      toNum: (n: string) => parseFloat(n) * 1e-2
    },
    {
      label: `${parameterDescriptions.vHalflife.name} (weeks)`,
      description: parameterDescriptions.vHalflife.text,
      value: vHalflife,
      setter: setVHalflife,
      min: 52 / 2,
      max: 52 * 2,
      step: 1,
      suffix: "",
      format: (n: number) => String(Math.round(n)),
      toText: (n: number) => String(Math.round(n)),
      toNum: (n: string) => Math.round(parseInt(n))
    }
  ];

  return (
    <InputParams
      inputFields={inputFields}
      onChangeCommited={setParentCurveParams}
    />
  );
}
