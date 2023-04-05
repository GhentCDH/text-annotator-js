import { Origin, type AnnotationTarget, type User } from '@annotorious/core';
import { v4 as uuidv4 } from 'uuid';
import type { TextAnnotationStore } from './state';
import type { TextAnnotation, TextSelector } from './model';

export const rangeToSelector = (range: Range, container: HTMLElement): TextSelector => {
  const rangeBefore = document.createRange();

  // A helper range from the start of the contentNode to the start of the selection
  rangeBefore.setStart(container, 0);
  rangeBefore.setEnd(range.startContainer, range.startOffset);

  const quote = range.toString();
  const start = rangeBefore.toString().length;
  const end = start + quote.length;

  return {  quote, start, end, range };
}

export const SelectionHandler = (container: HTMLElement, store: TextAnnotationStore) => {

  let currentUser: User;

  let currentTarget: AnnotationTarget = null;

  const setUser = (user: User) => currentUser = user;

  container.addEventListener('selectstart', () => {
    // Show native browser selection
    delete container.dataset.native;
  });

  document.addEventListener('selectionchange', () => {   
    const selection = document.getSelection();

    if (!selection.isCollapsed) {
      const ranges = Array.from(Array(selection.rangeCount).keys())
        .map(idx => selection.getRangeAt(idx));

      const updatedTarget = {
        annotation: currentTarget?.annotation || uuidv4(),
        selector: rangeToSelector(ranges[0], container),
        creator: currentUser,
        created: new Date()
      };
  
      if (currentTarget) {
        store.updateTarget(updatedTarget, Origin.LOCAL);
      } else {
        store.addAnnotation({
          id: updatedTarget.annotation,
          bodies: [],
          target: updatedTarget
        });
      }

      currentTarget = updatedTarget;
    }
  });

  document.addEventListener('pointerup', () => {
    const selection = document.getSelection();

    if (selection.isCollapsed)
      return;

    // Hide native browser selection
    container.dataset.native = 'hidden';

    currentTarget = null;

    /*
    const ranges = Array.from(Array(selection.rangeCount).keys())
      .map(idx => selection.getRangeAt(idx));

    const annotations = ranges.map(range => {
      const id = uuidv4();

      return {
        id,
        bodies: [],
        target: {
          annotation: id,
          selector: rangeToSelector(range, container),
          creator: currentUser,
          created: new Date()
        }
      }
    });

    store.bulkAddAnnotation(annotations, false);
    */
  });

  return {
    setUser
  }

}