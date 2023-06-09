import { logWarn } from "@solid-gadgets/utils";

import { MoveEventContext, SplitterDirection } from "./type";

export const COMPONENT_NAME = "ResizableSplitter";

export function moveEventHandler({
  event: e,
  paneSizes,
  lastPaneIdx,
  nextPaneIdx,
  containerRef,
  direction,
  paneInfo,
  setPaneSizes,
  isMovingToLast,
  pushOtherPane,
}: MoveEventContext) {
  if (lastPaneIdx < 0 || nextPaneIdx >= paneSizes.length) return;

  const lastPaneMinSize = paneInfo.minSizes[lastPaneIdx];
  const lastPaneMaxSize = paneInfo.maxSizes[lastPaneIdx];
  const nextPaneMinSize = paneInfo.minSizes[nextPaneIdx];
  const nextPaneMaxSize = paneInfo.maxSizes[nextPaneIdx];

  /**
   * Deal with the push other panes situation
   * when isMovingToLast is true or undefined, should be nextPaneIdx
   */
  const endIdx = isMovingToLast === false ? lastPaneIdx + 1 : nextPaneIdx;
  /** previous accumulated sizes of all the panes at the left/top side of current bar */
  const prevTotalSizePercent = paneSizes.slice(0, endIdx).reduce((total, size) => total + size, 0);

  /** the distance from the current bar to the left/top edge of the container */
  const offsetSize =
    direction === SplitterDirection.VERTICAL
      ? // should not use clientX/Y which will cause issue when scroller exists
        e.pageX - containerRef.offsetLeft
      : e.pageY - containerRef.offsetTop;

  const ContainerComputedStyle = getComputedStyle(containerRef);
  /** current accumulated widths of all the panes at the left side of current bar */
  const totalSizePercent =
    offsetSize /
    Number(
      direction === SplitterDirection.VERTICAL
        ? ContainerComputedStyle.width.replace("px", "")
        : ContainerComputedStyle.height.replace("px", "")
    );

  const sizeDiff = totalSizePercent - prevTotalSizePercent;
  /** whether dragging to left/top direction */
  const isMoveToLast = sizeDiff < 0;

  /** new size of the pane located at the left/top side of the bar */
  const lastPaneSizePercent = paneSizes[lastPaneIdx] + sizeDiff;
  const nextPaneSizePercent = paneSizes[nextPaneIdx] - sizeDiff;

  if (
    (!isMoveToLast && lastPaneSizePercent > lastPaneMaxSize) ||
    (isMoveToLast && nextPaneSizePercent > nextPaneMaxSize)
  )
    return;

  const isPushToLast = isMoveToLast && lastPaneSizePercent < lastPaneMinSize;
  const isPushToNext = !isMoveToLast && nextPaneSizePercent < nextPaneMinSize;

  if (!isPushToLast && !isPushToNext) {
    setPaneSizes(lastPaneIdx, lastPaneSizePercent);
    setPaneSizes(nextPaneIdx, nextPaneSizePercent);
    return;
  }

  if (!pushOtherPane) return;

  moveEventHandler({
    event: e,
    containerRef,
    lastPaneIdx: isPushToLast ? lastPaneIdx - 1 : lastPaneIdx,
    nextPaneIdx: isPushToNext ? nextPaneIdx + 1 : nextPaneIdx,
    direction,
    paneSizes,
    paneInfo,
    setPaneSizes,
    isMovingToLast: isMoveToLast,
    pushOtherPane,
  });
}

/**
 * - All sizes must be added to total 1
 * - Default setting is averaging the sizes to each pane
 * - The sizes of the rest unset panes are averaged
 * @param sizes pane sizes as percentage
 */
export function processSizes(sizes: number[]) {
  const totalSetSize = sizes.reduce((total, size) => total + size, 0);
  const averagedSizes = sizes.map(() => 1 / sizes.length);
  if (totalSetSize === 0) return averagedSizes;

  /** exceed 1, average each pane size */
  if (totalSetSize > 1) {
    logWarn("The total size of all panes exceed 1.", COMPONENT_NAME);
    return averagedSizes;
  }

  /** all the index of the pane without size attribute */
  const unsetSizeIdx: number[] = [];
  sizes.forEach((size, idx) => {
    if (size === 0) unsetSizeIdx.push(idx);
  });

  if (!unsetSizeIdx.length) {
    /** less than 1, average each pane size */
    if (totalSetSize < 1) {
      logWarn("The total size of all panes is less than 1.", COMPONENT_NAME);
      return averagedSizes;
    }

    return sizes;
  }

  /** average size of the unset panes */
  const averageSize = (1 - totalSetSize) / unsetSizeIdx.length;
  unsetSizeIdx.forEach(idx => (sizes[idx] = averageSize));
  return sizes;
}
