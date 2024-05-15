<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HighlightStyleExpression, TextAnnotation, TextAnnotatorOptions } from '@recogito/text-annotator';
import { createTextAnnotator } from '@recogito/text-annotator';

import '@recogito/text-annotator/dist/text-annotator.css';

onMounted(() => {
  const contentContainer = document.getElementById("to_annotate");
  createTextAnnotator(contentContainer);
});

</script>

<template>
  <div id="to_annotate" ref="to_annotate"><slot /></div>
</template>

<style scoped>

</style>
