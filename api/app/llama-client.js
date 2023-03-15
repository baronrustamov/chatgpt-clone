const WebSocket = require('ws');

function gen_input_text() {
  return "Human (" + (new Date()).toString() + "): ";
}

function gen_assistant_input_text() {
  return "Assistant (" + (new Date()).toString() + "):";
}

function reset(thread_id) {
  threads[thread_id] = `Assistant is a large language model called "Assistant", based on the LLaMA model trained by Meta.
Assistant knows how to do everything, including programming, question and response tasks, writing essays, articles, blogs, and more.
  
Conversation start date: ` + (new Date()).toString() + `
Instructions: Reply to "Human" as if you are a person.
  
The format used for the conversation is:
Human (time of message): (the human's message)
Assistant (time of message): (the Assistant's response)

`;
}

threads = {}

async function predict(input,max_tokens=500,temperature=0.7,top_p=0.01,top_k=40,no_repeat_ngram_size=0,num_beams=1,do_sample=true,length_penalty=5) {
  const response = await fetch("http://172.17.0.1:7860/run/textgen", {
    	method: "POST",
    	headers: { "Content-Type": "application/json" },
    	body: JSON.stringify({
    		data: [
    			input,
    			max_tokens,
    			do_sample,
    			temperature,
    			top_p,
    			1,
    			1.15,
    			top_k,
    		  10,
    			no_repeat_ngram_size,
    			num_beams,
    			0,
    		  length_penalty,
    			true,
    		]
    	})
    });
    
  const data = await response.json();

  rlol = data.data[0];

  return rlol;
}

async function predict_stream(input,progressCallback,max_tokens=500,temperature=0.7,top_p=0.01,top_k=40,no_repeat_ngram_size=0,num_beams=1,do_sample=true,length_penalty=5) {
  const socket = new WebSocket("ws://172.17.0.1:7860/queue/join");

  session_hash = crypto.randomUUID();

  length_current = input.length;

  done_with_genning = false;

  fin_gen_lol = "PLACEHOLDER";

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.msg) {
      case "send_hash":
        socket.send(JSON.stringify({
          "session_hash": session_hash,
          "fn_index": 7 // i have no fucking idea what this magic number is
        }));
        break;
      case "estimation":
        break;
      case "send_data":
        socket.send(JSON.stringify({
          "session_hash" : session_hash,
          "fn_index": 7,
          "data": [
            input,
      			max_tokens,
      			do_sample,
      			temperature,
      			top_p,
      			1,
      			1.15,
      			top_k,
      		  10,
      			no_repeat_ngram_size,
      			num_beams,
      			0,
      		  length_penalty,
      			false,
          ]
        }));
        break;
      case "process_starts":
        break;
      case "process_generating":
        try {
          var s = msg.output.data[0].slice(length_current);
          length_current += s.length;
          console.log(s);
          if (msg.output.data[0].slice(input.length) == fin_gen_lol) {
            socket.close();
            done_with_genning = true;
            break;
          }
          fin_gen_lol = msg.output.data[0].slice(input.length);
          console.log(fin_gen_lol)
          if (fin_gen_lol.includes("\nHuman (")) {
            socket.close();
            done_with_genning = true;
            break;
          }
          if (s.length > 0) {
            progressCallback(s);
          }
        } catch (e) {
          // lol
        }
        break;
      case "process_completed":
        try {
          fin_gen_lol = msg.output.data[0].slice(input.length);
          //          progressCallback("[DONE]");
        } catch (e) {
          // lol
        }
        socket.close();
        done_with_genning = true;
        break;
    }
  }

  const lol_do_it = () => new Promise(function(resolve, reject) {
    setInterval(function (resolve){
      if (done_with_genning) {
        resolve();
      }
    }, 100, resolve)
  });

  await lol_do_it();

  if (fin_gen_lol.includes("\nHuman ")) {
    fin_gen_lol = fin_gen_lol.slice(0, fin_gen_lol.lastIndexOf("\nHuman ("))
  }

  if (fin_gen_lol.length === 0) {
    fin_gen_lol = "(empty output)";
  }

  return fin_gen_lol.trim();
}

async function send_message(txt, thread_id) {
  input_text = gen_input_text();
  assistant_input_text = gen_assistant_input_text();

  if (!(thread_id in threads)) {
    reset(thread_id)
  }

  threads[thread_id] += input_text + txt + "\n" + assistant_input_text;
  tmp = await predict(threads[thread_id], max_tokens=10, temperature=0.7, top_p=0.01, top_k=40);
  tmp = (tmp.slice(threads[thread_id].length));
  threads[thread_id] += tmp + "\n";
  return tmp;
}

async function send_message_stream(txt, thread_id, progressCallback) {
  input_text = gen_input_text();
  assistant_input_text = gen_assistant_input_text();

  if (!(thread_id in threads)) {
    reset(thread_id)
  }

  threads[thread_id] += input_text + txt + "\n" + assistant_input_text;
  tmp = await predict_stream(threads[thread_id], progressCallback, max_tokens=500, temperature=0.7, top_p=0.01, top_k=40);
//  tmp = (tmp.slice(threads[thread_id].length));
  threads[thread_id] += tmp + "\n";
  return tmp;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const llamaClient = async ({ text, progressCallback, convo }) => {
//  if (!!convo.parentMessageId && !!convo.conversationId) {
//    options = { ...options, ...convo };
//  }

  if (!!convo.parentMessageId && !!convo.conversationId) {
    var lolId = convo.conversationId;
    var lolId2 = convo.parentMessageId;
  } else {
    var lolId = crypto.randomUUID();
    var lolId2 = crypto.randomUUID();
  }

  console.log(lolId);

  var rlol = await send_message_stream(text, lolId, progressCallback);

  const returnData = {
    id: crypto.randomUUID(),
    response: rlol,
    text: rlol,
//    response: "a",
    conversationId: lolId,
    parentMessageId: lolId2,
    messageId: crypto.randomUUID(),
    details: {}
  };

  const res = returnData;
  return res;
};

module.exports = { llamaClient };
