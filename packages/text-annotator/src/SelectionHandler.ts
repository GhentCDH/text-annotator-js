import { Origin, type User } from '@annotorious/core';
import { v4 as uuidv4 } from 'uuid';
import type { TextAnnotatorState } from './state';
import type { TextSelector, TextAnnotationTarget } from './model';

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

export const SelectionHandler = (container: HTMLElement, state: TextAnnotatorState) => {

  const { store, selection } = state;

  let currentUser: User;

  let currentTarget: TextAnnotationTarget = null;

  const setUser = (user: User) => currentUser = user;

  let isLeftClick = false;

  container.addEventListener('selectstart', (evt: PointerEvent) => {
    if (!isLeftClick)
      return;

    // Make sure we don't listen to selection changes that
    // were not started on the container, or which are not supposed to 
    // be annotatable (like the popup)
    const annotatable = !(evt.target as Node).parentElement.closest('.not-annotatable');
    if (annotatable) {
      currentTarget = {
        annotation: uuidv4(),
        selector: undefined,
        creator: currentUser,
        created: new Date()
      };
    }
  });

  document.addEventListener('selectionchange', (evt: PointerEvent) => { 
    const sel = document.getSelection();

    if (!sel.isCollapsed && isLeftClick) {
      const ranges = Array.from(Array(sel.rangeCount).keys())
        .map(idx => sel.getRangeAt(idx));
    
      currentTarget = {
        ...currentTarget,
        selector: rangeToSelector(ranges[0], container)
      };
  
      if (store.getAnnotation(currentTarget.annotation)) {
        store.updateTarget(currentTarget, Origin.LOCAL);
      } else {
        store.addAnnotation({
          id: currentTarget.annotation,
          bodies: [],
          target: currentTarget
        });

        selection.clickSelect(currentTarget.annotation, evt);
      }
    }
  });

  // Select events don't carry information about the mouse button
  // Therefore, to prevent right-click selection, we need to listen
  // to the initial pointerdown event and remember the button
  container.addEventListener('pointerdown', (evt: PointerEvent) =>
    isLeftClick = evt.button === 0);

  document.addEventListener('pointerup', (evt: PointerEvent) => {
    const annotatable = !(evt.target as Node).parentElement?.closest('.not-annotatable');
    if (!annotatable || !isLeftClick)
      return;

    setTimeout(() => {
      if (currentTarget?.selector) {
        store.updateTarget(currentTarget, Origin.LOCAL);

        selection.clickSelect(currentTarget.annotation, evt);
        currentTarget = null;
      } else {            
        const { x, y } = container.getBoundingClientRect();
        
        const hovered = store.getAt(evt.clientX - x, evt.clientY - y);
        if (hovered) {
          const { selected } = selection;
          
          if (selected.length !== 1 || selected[0].id !== hovered.id)
            selection.clickSelect(hovered.id, evt);
        } else if (!selection.isEmpty()) {
          selection.clear();
        }
      }
    }, 10);
  });

  return {
    setUser
  }

}