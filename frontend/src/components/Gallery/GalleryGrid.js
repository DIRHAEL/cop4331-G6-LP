import React, { useEffect, useState } from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
} from "react-virtualized";

function CellRenderer({ index, key, parent, style, list, setList, cache }) {
  const datum = list[index];

  // If datum is undefined, don't render anything
  if (!datum) {
    return null;
  }

  return (
    <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
      <div style={style}>
        <img
          alt={datum.caption}
          src={datum.source}
          style={{
            height: datum.imageHeight,
            width: datum.imageWidth,
          }}
        />
        <h4>{datum.caption}</h4>
      </div>
    </CellMeasurer>
  );
}

// Create a component that returns the Masonry JSX
function MyMasonryComponent() {
  const [list, setList] = useState([]);
  const [cache] = useState(
    () =>
      new CellMeasurerCache({
        defaultHeight: 200,
        defaultWidth: 200,
        fixedWidth: true,
      })
  );

  const cellPositioner = createMasonryCellPositioner({
    cellMeasurerCache: cache,
    columnCount: 2,
    columnWidth: 200,
    spacer: 10,
  });

  useEffect(() => {
    cache.clearAll();
    fetch("https://memorymap.xyz/posts/dmedi/661986e1aed87edfd1ea0248")
      .then((response) => response.json())
      .then((data) => {
        const newList = data.map((item) => ({
          source: item.imageUrl,
          imageHeight: 100,
          imageWidth: 100,
        }));
        setList(newList);
      });
  }, []); // Empty array means this effect will only run once, after the initial render

  return (
    <Masonry
      cellCount={list.length}
      cellMeasurerCache={cache}
      cellPositioner={cellPositioner}
      cellRenderer={(props) => (
        <CellRenderer {...props} list={list} setList={setList} cache={cache} />
      )}
      height={300}
      width={430}
    />
  );
}

export default MyMasonryComponent;
