import { useContext, useEffect } from 'react';
import { AnnotoriousContext } from '@annotorious/react';
import { TextAnnotatorOptions, RecogitoJS } from '@recogito/recogito-js';

export type TextAnnotatorProps = TextAnnotatorOptions & {

  element: string,

}

export const TextAnnotator = (props: TextAnnotatorProps) => {

  const { element, ...opts } = props;

  const { setAnno } = useContext(AnnotoriousContext);

  useEffect(() => {
    const el = element ? document.getElementById(element) : null;
    const r = RecogitoJS(el, opts);
    setAnno(r);
  }, []);

  return null;

}