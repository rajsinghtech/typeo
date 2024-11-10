import React from "react";

interface DraggableFlexProps {
  itemWidth: number;
  itemHeight: number;
  children?:
    | React.ReactElement<DraggableFlexItemProps>
    | Array<React.ReactElement<DraggableFlexItemProps>>;
}

export default function DraggableFlex({
  itemWidth,
  itemHeight,
  children,
}: DraggableFlexProps) {
  const [dropPositions, setDropPositions] = React.useState<
    { x: number; y: number }[]
  >([]);

  const [itemPositionsState, setItemPositionsState] = React.useState<string[]>(
    []
  );

  const [hoveringInfo, setHoveringInfo] = React.useState<{
    childId: string;
    xDifference: number;
    yDifference: number;
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const update = () => {
      const newDropPositions =
        React.Children.map(children, (_, index) => {
          const parent = document.getElementById(`parent_${index}`);
          return { x: parent?.offsetLeft || 0, y: parent?.offsetTop || 0 };
        }) || [];

      let newPositions = [...itemPositionsState];

      const newChildIds =
        React.Children.map(children, (child) => child?.props.id) || [];

      const alreadyExistingChildren = newPositions.filter(
        (childId) => newChildIds.includes(childId) && childId !== "New"
      );

      const newChildren = newChildIds.filter(
        (childId) =>
          !alreadyExistingChildren.includes(childId) || childId === "New"
      );

      newPositions = [...alreadyExistingChildren, ...newChildren];

      newPositions.forEach((childId, index) => {
        const childElement = document.getElementById(`child_${childId}`);
        if (childElement) {
          childElement.style.left = `${newDropPositions[index].x}px`;
          childElement.style.top = `${newDropPositions[index].y}px`;
        }
      });

      setDropPositions(newDropPositions);
      if (JSON.stringify(newPositions) !== JSON.stringify(itemPositionsState)) {
        setItemPositionsState(newPositions);
      }
    };

    update();

    window.onresize = () => {
      update();
    };

    return () => {
      window.onresize = null;
    };
  }, [children, itemPositionsState]);

  React.useEffect(() => {
    if (!hoveringInfo) return;

    const { childId, xDifference, yDifference } = hoveringInfo;
    const draggableElement = document.getElementById(`child_${childId}`);

    const itemPositions = [...itemPositionsState];

    function mousemoveListener(event: MouseEvent) {
      event.preventDefault();
      const { left, top } = containerRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };
      const newX = clamp(
        event.pageX - xDifference - left,
        0,
        (containerRef.current?.offsetWidth || 0) - itemWidth
      );
      const newY = clamp(
        event.pageY - yDifference - top,
        0,
        (containerRef.current?.offsetHeight || 0) - itemHeight
      );

      if (draggableElement) {
        draggableElement.style.left = `${newX}px`;
        draggableElement.style.top = `${newY}px`;
      }

      let count = 0;
      for (const position of dropPositions) {
        const distance = Math.sqrt(
          Math.pow(newX - position.x, 2) + Math.pow(newY - position.y, 2)
        );
        if (
          distance < itemWidth * 0.4 &&
          count !== itemPositions.indexOf(childId) &&
          itemPositions[count] !== "New"
        ) {
          const indexItem = itemPositions.indexOf(childId);
          const replacedElement = document.getElementById(
            `child_${itemPositions[count]}`
          );
          if (replacedElement) {
            replacedElement.style.left = `${dropPositions[indexItem].x}px`;
            replacedElement.style.top = `${dropPositions[indexItem].y}px`;
          }
          itemPositions[indexItem] = itemPositions[count];
          itemPositions[count] = childId;

          break;
        }
        count++;
      }
    }

    function mouseupListener(event: MouseEvent) {
      event.preventDefault();
      if (draggableElement) {
        draggableElement.style.left = `${
          dropPositions[itemPositions.indexOf(childId)].x
        }px`;
        draggableElement.style.top = `${
          dropPositions[itemPositions.indexOf(childId)].y
        }px`;
      }
      document.onmousemove = null;
      document.onmouseup = null;
      setHoveringInfo(null);
      setItemPositionsState(itemPositions);
    }

    document.onmousemove = mousemoveListener;
    document.onmouseup = mouseupListener;

    return () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }, [hoveringInfo, dropPositions, itemWidth, itemHeight, itemPositionsState]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        gap: "30px",
        position: "relative",
      }}
      ref={containerRef}
    >
      {React.Children.map(children, (child, index) => {
        const childId = child?.props?.id;
        return (
          <div key={index}>
            <div
              key={`parent_${index}`}
              id={`parent_${index}`}
              style={{
                width: itemWidth,
                height: itemHeight,
              }}
            />
            <div
              id={`child_${childId}`}
              style={{
                position: "absolute",
                width: itemWidth,
                height: itemHeight,
                transition:
                  hoveringInfo?.childId !== childId
                    ? "left 0.3s, top 0.3s"
                    : "none",
              }}
              onMouseDown={
                childId !== "New"
                  ? (event: React.MouseEvent) => {
                      const childElement = document.getElementById(
                        `child_${childId}`
                      );

                      if (childElement) {
                        const xDifference =
                          event.pageX -
                          childElement.getBoundingClientRect().left;

                        const yDifference =
                          event.pageY -
                          childElement.getBoundingClientRect().top;

                        if (childId)
                          setHoveringInfo({
                            childId,
                            xDifference,
                            yDifference,
                          });
                      }
                    }
                  : undefined
              }
            >
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DraggableFlexItemProps {
  id: string;
  children?: React.ReactNode;
}

export function DraggableFlexItem({ children }: DraggableFlexItemProps) {
  return <>{children}</>;
}

const clamp = (num: number, min: number, max: number) => {
  return num <= min ? min : num >= max ? max : num;
};
