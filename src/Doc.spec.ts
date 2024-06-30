import { DocumentLike, parse } from "@beforesemicolon/html-parser";
import { Doc } from "./Doc";
import { ReactiveNode } from './ReactiveNode'

describe("Doc", () => {
  const dynamicValueCollector = jest.fn();
  let refs: Record<string, Set<Element>> = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    refs = {};
  });
  
  it("should parse plain html", () => {
    const res = parse(
      "<p>simple</p>",
      Doc([], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLParagraphElement);
    expect((res.childNodes[0] as HTMLParagraphElement).outerHTML).toBe("<p>simple</p>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse comment", () => {
    const res = parse(
      "<!-- <p>simple</p> -->",
      Doc([], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(Comment);
    expect((res.childNodes[0] as Comment).nodeValue).toBe(" <p>simple</p> ");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse plain html with static injected value", () => {
    const res = parse(
      "<p>$val0</p>",
      Doc(["simple"], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLParagraphElement);
    expect((res.childNodes[0] as HTMLParagraphElement).outerHTML).toBe("<p>simple</p>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse plain html with dynamic injected value", () => {
    const fn = () => "simple";
    const res = parse(
      "<p>$val0</p>",
      Doc([fn], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLParagraphElement);
    expect((res.childNodes[0] as HTMLParagraphElement).outerHTML).toBe("<p>simple</p>");
    expect(dynamicValueCollector).toHaveBeenCalledTimes(1);
    expect(dynamicValueCollector).toHaveBeenCalledWith(expect.any(ReactiveNode));
  });
  
  it("should parse event attribute", () => {
    const handler = () => {
    };
    const res = parse(
      "<button type=\"button\" onclick=\"$val0\">click me</button>",
      Doc([handler], {}, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse event attribute with option", () => {
    const handler = () => {
    };
    const res = parse(
      '<button type="button" onclick="$val0, $val1">click me</button>',
      Doc([handler, {once: true}], {}, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse and ignore unknown event attribute", () => {
    const handler = () => {
    };
    const res = parse(
      "<button type=\"button\" onval=\"$val0\">click me</button>",
      Doc([handler], {}, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).toHaveBeenCalledTimes(1);
    expect(dynamicValueCollector).toHaveBeenCalledWith(expect.any(Function));
  });
  
  it("should parse event attribute for webComponent", () => {
    class MyButton extends HTMLElement {
    }
    
    customElements.define("my-button", MyButton);
    
    const handler = () => {
    };
    const res = parse(
      "<my-button type=\"button\" onval=\"$val0\">click me</my-button>",
      Doc([handler], {}, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(MyButton);
    expect((res.childNodes[0] as MyButton).outerHTML).toBe("<my-button type=\"button\">click me</my-button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse ref attribute", () => {
    const res = parse(
      "<button type=\"button\" ref=\"btn\">click me</button>",
      Doc([], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
    expect(refs["btn"].size).toBe(1);
    expect(refs["btn"].has(res.childNodes[0] as HTMLButtonElement)).toBeTruthy();
  });
  
  it("should handle boolean, class, style and data attributes", () => {
    const active = () => true;
    const loading = () => false;
    const disabled = () => true;
    const sample = () => false;
    
    
    const res = parse(
      "<button type=\"button\" class=\"btn\" class.active=\"$val0\" style.loading=\"color: blue; | $val1\" disabled=\"$val2\" data.sample=\"$val3\">click me</button>",
      Doc([active, loading, disabled, sample], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe('<button type="button" class="btn active" disabled="true">click me</button>');
    expect(dynamicValueCollector).toHaveBeenCalledTimes(4);
    
    
    expect(dynamicValueCollector.mock.calls[0][0]).toEqual(expect.any(Function));
    expect(dynamicValueCollector.mock.calls[1][0]).toEqual(expect.any(Function));
    expect(dynamicValueCollector.mock.calls[2][0]).toEqual(expect.any(Function));
    expect(dynamicValueCollector.mock.calls[3][0]).toEqual(expect.any(Function));
  });
  
  it("should parse and ignore boolean attributes with false value", () => {
    const res = parse(
      "<button type=\"button\" disabled=\"false\">click me</button>",
      Doc([], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
  
  it("should parse and ignore injected value names", () => {
    const res = parse(
      '<button type="button" $val0="true">click me</button>',
      Doc(['disabled'], refs, dynamicValueCollector) as unknown as DocumentLike
    );
    
    expect(res.childNodes.length).toBe(1);
    expect(res.childNodes[0]).toBeInstanceOf(HTMLButtonElement);
    expect((res.childNodes[0] as HTMLButtonElement).outerHTML).toBe("<button type=\"button\">click me</button>");
    expect(dynamicValueCollector).not.toHaveBeenCalled();
  });
});
