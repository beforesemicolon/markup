import { resolveDynamicValueToNodes } from "./resolve-dynamic-value-to-nodes";
import { DynamicValue, DynamicValueType } from "../types";
import { element } from "./element";
import { when } from "../helpers";
import { html } from "../html";

describe('resolveDynamicValueToNodes', () => {
  const getDynamicValue = (value: unknown): DynamicValue => ({
    name: 'nodeValue',
    type: DynamicValueType.Content,
    value,
    renderedNodes: [document.createTextNode('$val0')],
    data: '',
    rawValue: '$val0',
    prop: null,
  });
  
  it('should resolve text value', () => {
    const dv: DynamicValue = getDynamicValue('hello');
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(1);
    expect(res[0]).not.toEqual(dv.renderedNodes[0]);
    expect(res[0].textContent).toBe('hello');
    
    const node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).toEqual(node);
    expect(res[0].textContent).toBe('hello');
  })
  
  it('should resolve node value', () => {
    const dv = getDynamicValue(element('p', {textContent: 'sample'}));
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(1);
    expect(res[0]).not.toEqual(dv.renderedNodes[0]);
    expect(res[0].textContent).toBe('sample');
    
    const node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).toEqual(node);
    expect(res[0].textContent).toBe('sample');
  })
  
  it('should resolve function value', () => {
    let total = 12;
    const dv = getDynamicValue(() => total);
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(1);
    expect(res[0]).not.toEqual(dv.renderedNodes[0]);
    expect(res[0].textContent).toBe('12');
    
    let node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).toEqual(node);
    expect(res[0].textContent).toBe('12');
    
    total = 24;
    
    node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).not.toEqual(node);
    expect(res[0].textContent).toBe('24');
  })
  
  it('should resolve helper value', () => {
    let v = true;
    const dv = getDynamicValue(when(() => v, 'is truthy', 'is falsy'));
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(1);
    expect(res[0]).not.toEqual(dv.renderedNodes[0]);
    expect(res[0].textContent).toBe('is truthy');
    
    let node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).toEqual(node);
    expect(res[0].textContent).toBe('is truthy');
    
    v = false;
    
    node = res[0]
    
    dv.renderedNodes = [...res];
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0]).not.toEqual(node);
    expect(res[0].textContent).toBe('is falsy');
  })
  
  it('should resolve array value', () => {
    const dv = getDynamicValue([[['x', 12]]]);
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(2);
    expect(res).not.toEqual(dv.renderedNodes);
    expect(res[0].nodeValue).toBe('x');
    expect(res[1].nodeValue).toBe('12');
  })
  
  it('should resolve HTML template', () => {
    const dv = getDynamicValue(html`sample`);
    let res = resolveDynamicValueToNodes(dv);
    
    expect(res).toHaveLength(1);
    expect(res).not.toEqual(dv.renderedNodes);
    expect(res[0].nodeValue).toBe('sample');
    
    res = resolveDynamicValueToNodes(dv);
    
    expect(res[0].nodeValue).toBe('sample');
  })
  
  it('should ignore non-content dynamic value', () => {
    const dv = {
      ...getDynamicValue(html`sample`),
      type: DynamicValueType.Attribute,
    };
    
    expect(resolveDynamicValueToNodes(dv)).toEqual(dv.renderedNodes)
  })
})
