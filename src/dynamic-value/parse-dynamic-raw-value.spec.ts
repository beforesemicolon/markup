import { parseDynamicRawValue } from "./parse-dynamic-raw-value";

describe("parseDynamicRawValue", () => {
  it("should return raw value if no placeholder preset", () => {
    expect(
      parseDynamicRawValue(
        "just a simple straight up text",
        [12, 45]
      )
    ).toEqual(["just a simple straight up text"]);
  });
  
  it("should collect single value", () => {
    expect(
      parseDynamicRawValue("$val0", [12, 45])
    ).toEqual(["12"]);
  });
  
  it("should collect single value mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "$val0 in between $val1",
        [12, 24, 36]
      )
    ).toEqual([
      "12 in between 24"
    ]);
  });
  
  it("should collect multiple values", () => {
    expect(
      parseDynamicRawValue(
        "$val0 $val1",
        [12, 24, 36]
      )
    ).toEqual(["12 24"]);
  });
  
  it("should collect multiple values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text",
        [12, 24, 36]
      )
    ).toEqual(["heading 12 middle 24 tail text"]);
  });
  
  it("should collect multiple dynamic values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text $val2",
        [() => 12, () => 24, 36]
      )
    ).toEqual([
      "heading ",
      {
        "text": "$val0",
        "value": expect.any(Function)
      },
      " middle ",
      {
        "text": "$val1",
        "value": expect.any(Function)
      },
      " tail text 36"
    ]);
  });
});
