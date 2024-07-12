import { parseDynamicRawValue } from "./parse-dynamic-raw-value";

describe("parseDynamicRawValue", () => {
  const cbMock = jest.fn();
  
  beforeEach(() => {
    cbMock.mockClear();
  });
  
  it("should return raw value if no placeholder preset", () => {
    expect(
      parseDynamicRawValue(
        "just a simple straight up text",
        [12, 45],
          cbMock
      )
    ).toEqual(["just a simple straight up text"]);
    
    expect(cbMock).toHaveBeenCalledTimes(1)
  });
  
  it("should collect single value", () => {
    expect(
      parseDynamicRawValue("$val0", [12, 45], cbMock)
    ).toEqual([12]);
    
    expect(cbMock).toHaveBeenCalledTimes(1)
  });
  
  it("should collect single value mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "$val0 in between $val1",
        [12, 24, 36], cbMock
      )
    ).toEqual([
      12,
      " in between ",
      24
    ]);
    
    expect(cbMock).toHaveBeenCalledTimes(3)
  });
  
  it("should collect multiple values", () => {
    expect(
      parseDynamicRawValue(
        "$val0 $val1",
        [12, 24, 36], cbMock
      )
    ).toEqual([
      12,
      " ",
      24
    ]);
    
    expect(cbMock).toHaveBeenCalledTimes(3)
  });
  
  it("should collect multiple values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text",
        [12, 24, 36], cbMock
      )
    ).toEqual([
      "heading ",
      12,
      " middle ",
      24,
      " tail text"
    ]);
    
    expect(cbMock).toHaveBeenCalledTimes(5)
  });
  
  it("should collect multiple dynamic values mixed with other content", () => {
    expect(
      parseDynamicRawValue(
        "heading $val0 middle $val1 tail text $val2",
        [() => 12, () => 24, 36],
          cbMock
      )
    ).toEqual([
      "heading ",
      expect.any(Function),
      " middle ",
      expect.any(Function),
      " tail text ",
      36
    ]);
    
    expect(cbMock).toHaveBeenCalledTimes(6)
  });
});
