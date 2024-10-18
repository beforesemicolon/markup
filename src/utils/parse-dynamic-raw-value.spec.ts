import { parseDynamicRawValue } from "./parse-dynamic-raw-value";

describe("parseDynamicRawValue", () => {
  
  it("should return raw value if no placeholder preset", () => {
    expect(
      parseDynamicRawValue(
        "just a simple straight up text"
      )
    ).toEqual(["just a simple straight up text"]);
    
  });
  
  it("should collect single value", () => {
    expect(
      parseDynamicRawValue("$val0")
    ).toEqual([0]);
    
  });
  
  it("should collect single value mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "$val0 in between $val1"
      )
    ).toEqual([
      0,
      " in between ",
      1
    ]);
    
  });
  
  it("should collect multiple values", () => {
    expect(
      parseDynamicRawValue(
        "$val0 $val1"
      )
    ).toEqual([
      0,
      " ",
      1
    ]);
    
  });
  
  it("should collect multiple values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text"
      )
    ).toEqual([
      "heading ",
      0,
      " middle ",
      1,
      " tail text"
    ]);
    
  });
  
  it("should collect multiple dynamic values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text $val2"
      )
    ).toEqual([
      "heading ",
      0,
      " middle ",
      1,
      " tail text ",
      2
    ]);
    
  });
});
