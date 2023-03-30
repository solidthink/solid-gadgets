import { Splitter, Pane } from "@solid-gadgets/components";
import "./index.scss";

export default () => {
  const childStyle = { width: "100%", height: "100%" };

  return (
    <>
      <Splitter customClass="splitter-parent" resizeBarClass="resize-bar">
        <Pane minSize="10" size="30">
          <div style={{ ...childStyle, background: "brown" }}>child1</div>
        </Pane>
        <Pane customClass="my-pane">
          <div style={{ ...childStyle, background: "lightblue" }}>child2</div>
        </Pane>
        <Pane customClass="my-pane">
          <div style={{ ...childStyle, background: "pink" }}>child3</div>
        </Pane>
        <Pane customClass="my-pane" maxSize="50">
          <Splitter customClass="splitter-child" horizontal>
            <Pane customClass="my-pane">
              <div style={{ ...childStyle, background: "lightblue" }}>child4-1</div>
            </Pane>
            <Pane customClass="my-pane">
              <div style={{ ...childStyle, background: "lightblue" }}>child4-2</div>
            </Pane>
            <Pane customClass="my-pane">
              <div style={{ ...childStyle, background: "lightblue" }}>child4-3</div>
            </Pane>
          </Splitter>
        </Pane>
        <Pane customClass="my-pane" size="20">
          <div style={{ ...childStyle, background: "pink" }}>child5</div>
        </Pane>
      </Splitter>
    </>
  );
};