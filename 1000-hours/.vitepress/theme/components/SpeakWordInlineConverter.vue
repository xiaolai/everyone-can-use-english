<script setup>
import { onMounted, watch } from "vue";
import { useRouter } from 'vitepress';
const router = useRouter();

watch(() => router.route.data.relativePath, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    setTimeout(() => {
      buildSpeakWordInline();
      console.log("route changed", newVal, oldVal);
    }, 200);
  }
}, { immediate: true });

function buildPlayButton(parent, accent, gender, url) {
  gender = gender || 'male';
  accent = accent || 'us';

  const labelEl = document.createElement('span');
  labelEl.classList.add('accent-label');
  labelEl.innerText = accent.toUpperCase();
  const audioEl = document.createElement('audio');
  audioEl.classList.add('audio')
  audioEl.setAttribute('src', url)
  audioEl.setAttribute('controls', 'false')
  const iconEl = document.createElement('img');
  iconEl.classList.add('icon');
  const emojiEl = document.createElement('span');
  emojiEl.classList.add('emoji');

  let svg = '/images/speaker-white.svg';
  let iconEmoji = '';
  if (accent === 'uk') {
    iconEmoji = '🇬🇧';
  } else if (accent === 'us') {
    iconEmoji = '🇺🇸';
  }

  iconEl.setAttribute('src', svg)
  iconEl.innerText = accent.toUpperCase();
  emojiEl.innerText = iconEmoji

  const btnEl = document.createElement('button')
  btnEl.classList.add('play-button')
  btnEl.classList.add(accent);
  btnEl.classList.add(gender);
  btnEl.addEventListener('click', () => {
    audioEl.play();
  })
  // btnEl.append(labelEl)
  btnEl.append(emojiEl)
  btnEl.append(iconEl)
  btnEl.append(audioEl)
  parent.append(btnEl)
}

function fillDataAudio(el) {
  let dataAudio = [];
  dataAudio.push({accent: 'us', gender: '', value: el.getAttribute('data-audio-us') || null})
  dataAudio.push({accent: 'uk', gender: '', value: el.getAttribute('data-audio-uk') || null})
  dataAudio.push({accent: 'other', gender: '', value: el.getAttribute('data-audio-other') || null})
  dataAudio.push({accent: 'us', gender: 'male', value: el.getAttribute('data-audio-us-male') || null})
  dataAudio.push({accent: 'uk', gender: 'male', value: el.getAttribute('data-audio-uk-male') || null})
  dataAudio.push({accent: 'other', gender: 'male', value: el.getAttribute('data-audio-other-male') || null})
  dataAudio.push({accent: 'us', gender: 'female', value: el.getAttribute('data-audio-us-female') || null})
  dataAudio.push({accent: 'uk', gender: 'female', value: el.getAttribute('data-audio-uk-female') || null})
  dataAudio.push({accent: 'other', gender: 'female', value: el.getAttribute('data-audio-other-female') || null})

  // remove null item
  dataAudio = dataAudio.filter((item) => item.value !== null)
  return dataAudio
}

function convertToInlineComponent(el) {
  if (el.getAttribute('data-converted')) {
    return;
  }

  // fill dataAudio
  const dataAudio = fillDataAudio(el);
  console.log('inline component', dataAudio)

  const wrapperEl = document.createElement('div')
  wrapperEl.classList.add('speak-word-wrapper')
  const canEl = document.createElement('div')
  canEl.classList.add('speak-word')
  canEl.classList.add('inline')

  if (dataAudio.length > 0) {
    const ctrlEl = document.createElement('div')
    ctrlEl.classList.add('ctrl')
    for (let i = 0; i < dataAudio.length; i += 1) {
      const audioItem = dataAudio[i];
      const ctrlPartEl = document.createElement('div')
      ctrlPartEl.classList.add('ctrl-part')
      console.log(audioItem);
      if (audioItem) {
        buildPlayButton(ctrlPartEl, audioItem.accent, audioItem.gender, audioItem.value)
      }
      ctrlEl.append(ctrlPartEl);
    }
    // const ctrlPartEl = document.createElement('div')
    // ctrlPartEl.classList.add('ctrl-part')
    // if (dataAudioUs) {
    //   buildPlayButton(ctrlPartEl, 'us', dataAudioUs)
    // }
    // ctrlEl.append(ctrlPartEl);

    // const ctrlPartEl2 = document.createElement('div')
    // ctrlPartEl2.classList.add('ctrl-part')
    // if (dataAudioUk) {
    //   buildPlayButton(ctrlPartEl2, 'uk', dataAudioUk)
    // }
    // ctrlEl.append(ctrlPartEl2);

    // const ctrlPartEl3 = document.createElement('div')
    // ctrlPartEl3.classList.add('ctrl-part')
    // if (dataAudioOther) {
    //   buildPlayButton(ctrlPartEl3, 'other', dataAudioOther)
    // }
    // ctrlEl.append(ctrlPartEl3);

    canEl.append(ctrlEl)
  }
  wrapperEl.append(canEl)
  // insert at el's side
  el.insertAdjacentElement('afterend', wrapperEl)
  el.style.display = 'none'
  el.setAttribute('data-converted', 'true')
}

function buildSpeakWordInline() {
  const inlinePlayerEls = document.querySelectorAll('.speak-word-inline')
  for (let i = 0; i < inlinePlayerEls.length; i += 1) {
    convertToInlineComponent(inlinePlayerEls[i]);
  }
}

</script>

<template>

</template>

<style lang="scss">
</style>