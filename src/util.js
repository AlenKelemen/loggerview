/**
 * <body>
  <script>
    document.body.appendChild(elt("button", {
      onclick: () => console.log("click")
    }, "The button"));
  </script>
</body>
 * 
 * @export
 * @param {string} type node name
 * @param {Object} props props 
 * @param {string} children list of children
 * @returns {Object} DOM element
 */
export function elt(type, props, ...children) {
    let dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    for (let child of children) {
      if (typeof child != "string") dom.appendChild(child);
      else dom.appendChild(document.createTextNode(child));
    }
    return dom;
  }