import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  models: [
    {
      _id: '0',
      name: 'ChatLLaMA',
      value: 'ChatLLaMA'
    },
    {
      _id: '1',
      name: 'ChatGPT',
      value: 'chatgpt'
    },
    {
      _id: '2',
      name: 'CustomGPT',
      value: 'chatgptCustom'
    },
    {
      _id: '3',
      name: 'BingAI',
      value: 'bingai'
    },
    {
      _id: '4',
      name: 'Sydney',
      value: 'sydney'
    },
    {
      _id: '5',
      name: 'ChatGPT',
      value: 'chatgptBrowser'
    },
  ],
  modelMap: {},
  initial: { ChatLLaMA: true, chatgpt: true, chatgptCustom: true, bingai: true, sydney: true, chatgptBrowser: true }
  // initial: { chatgpt: true, chatgptCustom: true, bingai: true, }
};

const currentSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModels: (state, action) => {
      const models = [...initialState.models, ...action.payload];
      state.models = models;
      const modelMap = {};

      models.slice(initialState.models.length).forEach((modelItem) => {
        modelMap[modelItem.value] = {
          chatGptLabel: modelItem.chatGptLabel,
          promptPrefix: modelItem.promptPrefix
        };
      });

      state.modelMap = modelMap;
    }
  }
});

export const { setModels } = currentSlice.actions;

export default currentSlice.reducer;
