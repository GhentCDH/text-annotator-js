<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HighlightStyleExpression, TextAnnotation, TextAnnotatorOptions } from '@recogito/text-annotator';
import { createTextAnnotator } from '@recogito/text-annotator';

import '@recogito/text-annotator/dist/text-annotator.css';

const mouseLocation  = ref({ x: 0, y: 0 });
const scrollLocation = ref({ x: 0, y: 0 });
const dialogLocation = ref({ x: 0, y: 0 });


const handlePointerUp = (event: PointerEvent) => {
  mouseLocation.value = { x: event.clientX, y: event.clientY };
  dialogLocation.value = { x: event.clientX + scrollLocation.value.x, y: event.clientY + scrollLocation.value.y};
  console.log('Pointer up event triggered', mouseLocation.value );
}

const updateScrollPosition = () => {
  
  var newLocation = { x: window.scrollX, y: window.scrollY };
  //var diffLocation = { x: scrollLocation.value.x - newLocation.x, y: scrollLocation.value.y - newLocation.y };

  //dialogLocation.value = { x: dialogLocation.value.x - diffLocation.x, y: dialogLocation.value.y - diffLocation.y };

  scrollLocation.value = newLocation;
  
  console.log('Scroll position', scrollLocation.value);
}

onMounted(() => {
  const contentContainer = document.getElementById("to_annotate");
  
  const annotator = createTextAnnotator(contentContainer);
  
  /*
  annotator.loadAnnotations("/annotations.w3c.json").then((a) =>
    console.log("loaded annotations from json file", a.length),
  );
  */

  annotator.on("createAnnotation", (annotation) => {
    console.log("createAnnotation", annotation);
  });
  annotator.on("updateAnnotation", (annotation, previous) => {
    console.log("updateAnnotation", annotation, previous);
  });

  annotator.on("deleteAnnotation", (annotation) => {
    console.log("deleteAnnotation", annotation);
  });

  annotator.on("selectionChanged", (annotations) => {
    console.log("selectionChanged", annotations);
  });
  annotator.on("viewportIntersect", (annotations) => {
    console.log("viewport", annotations);
  });

  window.addEventListener('scroll', updateScrollPosition)

  window.annotator = annotator;

});

</script>

<template>
  <div id="to_annotate" @pointerup="handlePointerUp" ref="to_annotate"><slot /></div>

  <div :style="{backgroundColor: 'green',color: 'white', position: 'absolute', padding: '10px 10px' , top: `${dialogLocation.y}px`, left: `${dialogLocation.x}px` }">
    floating div
  </div>

</template>

<style scoped>

</style>
