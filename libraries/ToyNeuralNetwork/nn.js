// class NeuroEvolution {
//   constructor(a, b, c, d) {
//     if (a instanceof tf.Sequential) {
//       this.model = a;
//       this.in = b;
//       this.hn = c;
//       this.on = d;
//       // this.task = task;
//     } else {
//       this.in = a;
//       this.hn = b;
//       this.on = c;
//       this.model = this.createModel();
//       // this.task = d != null ? d : "classification";
//     }
//   }

//   copy() {
//     return tf.tidy(() => {
//       const modelCopy = this.createModel();
//       const weights = this.model.getWeights();
//       const weightCopies = [];
//       for (let i = 0; i < weights.length; i++) {
//         weightCopies[i] = weights[i].clone();
//       }

//       modelCopy.setWeights(weightCopies);
//       return new NeuroEvolution(modelCopy, this.in, this.hn, this.on);
//     });
//   }

//   dispose() {
//     this.model.dispose();
//   }

//   mutate(rate) {
//     tf.tidy(() => {
//       const weights = this.model.getWeights();
//       const mutatedWeights = [];
//       weights.forEach((tensor, i) => {
//         const { shape } = tensor;
//         const values = tensor.dataSync().slice();
//         values.forEach((w, j) => {
//           if (random(1) < rate) {
//             values[j] = w + randomGaussian();
//           }
//         });
//         const newTensor = tf.tensor(values, shape);
//         mutatedWeights.push(newTensor);
//       });
//       this.model.setWeights(mutatedWeights);
//     });
//   }

//   createModel() {
//     const model = tf.sequential();
//     model.add(
//       tf.layers.dense({
//         inputShape: [this.in],
//         units: this.hn,
//         activation: "relu",
//       })
//     );
//     model.add(
//       tf.layers.dense({
//         units: this.on,
//         activation: "softmax",
//       })
//     );
//     return model;
//   }
//   query(arr) {
//     return tf.tidy(() => {
//       if (arr.length != this.in) {
//         throw new Error(
//           "The array's length is not equal to the number of inputs"
//         );
//       }

//       const xs = tf.tensor2d([arr]);
//       const ys = this.model.predict(xs).dataSync();
//       return ys;
//     });
//   }
// }
// Other techniques for learning

class ActivationFunction {
  constructor(func, dfunc) {
    this.func = func;
    this.dfunc = dfunc;
  }
}

let sigmoid = new ActivationFunction(
  (x) => 1 / (1 + Math.exp(-x)),
  (y) => y * (1 - y)
);

let tanh = new ActivationFunction(
  (x) => Math.tanh(x),
  (y) => 1 - y * y
);

function mapTensor(tensor, func) {
  const data = tensor.dataSync().slice();
  const { shape } = tensor;
  for (let i = 0; i < data.length; i++) {
    data[i] = func(data[i]);
  }
  return tf.tensor(data, shape);
}

function copyTensor(tensor) {
  const data = tensor.dataSync();
  const { shape } = tensor;
  return tf.tensor(data, shape);
}

class NeuroEvolution {
  /*
   * if first argument is a NeuralNetwork the constructor clones it
   * USAGE: cloned_nn = new NeuralNetwork(to_clone_nn);
   */
  constructor(arr) {
    if (arr instanceof NeuroEvolution) {
      this.nodes = arr.nodes;

      this.weights = [];
      this.biases = [];
      for (let i = 0; i < arr.weights.length; i++) {
        this.weights[i] = copyTensor(arr.weights[i]);
      }
      for (let i = 0; i < arr.biases.length; i++) {
        this.biases[i] = copyTensor(arr.biases[i]);
      }
    } else {
      this.weights = [];
      this.biases = [];

      this.nodes = arr;

      for (let i = 0; i < this.nodes.length - 1; i++) {
        const num = this.nodes[i];
        this.weights.push(
          mapTensor(tf.zeros([arr[i + 1], num]), (e) => e + randomGaussian(0, 0.1))
        );
      }

      for (let i = 1; i < this.nodes.length; i++) {
        const num = this.nodes[i];
        this.biases.push(
          mapTensor(tf.zeros([num, 1]), (e) => e + randomGaussian(0, 0.1))
        );
      }

      // this.weights_ih.print();
      // this.weights_ho.print();
      // console.log(this.weights_ih.shape);
      // console.log(this.weights_ho.shape);
      // this.bias_h = mapTensor(
      //   tf.zeros([this.hidden_nodes, 1]),
      //   (e) => e + randomGaussian()
      // );
      // this.bias_o = mapTensor(
      //   tf.zeros([this.output_nodes, 1]),
      //   (e) => e + randomGaussian()
      // );
      // // this.bias_h.print();
      // this.bias_o.print();
      // console.log(this.bias_h.shape);
      // console.log(this.bias_o.shape);
    }

    // TODO: copy these as well
    this.setLearningRate();
    this.setActivationFunction();
  }

  query(input_array) {
    return tf.tidy(() => {
      // Generating the Hidden Outputs
      let weights = [tf.tensor2d(input_array, [input_array.length, 1])];

      for (let i = 0; i < this.weights.length; i++) {
        let weight = tf.dot(this.weights[i], weights[i]);
        weight = weight.add(this.biases[i]);
        // activation function!
        weight = weight.sigmoid();
        weights.push(weight);
      }

      const data = Array.from(weights[weights.length - 1].dataSync());
      // const sum = data.reduce((acc, val) => acc + val, 0);
      // weights[weights.length - 1] = mapTensor(
      //   weights[weights.length - 1],
      //   (e) => e / sum
      // );
      //console.log(data);
      // Sending back to the caller!

      // inputs.dispose();
      // hidden.dispose();
      // output.dispose();

      return data;
    });
  }

  setLearningRate(learning_rate = 0.1) {
    this.learning_rate = tf.scalar(learning_rate);
  }

  setActivationFunction(func = sigmoid) {
    this.activation_function = func;
  }

  dispose() {
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i].dispose();
    }
    for (let i = 0; i < this.biases.length; i++) {
      this.biases[i].dispose();
    }
    this.learning_rate.dispose();
  }

  train(input_array, target_array) {
    // Generating the Hidden Outputs
    let weights = [tf.tensor2d(input_array, [input_array.length, 1])];

    for (let i = 0; i < this.weights.length; i++) {
      let weight = tf.dot(this.weights[i], weights[i]);
      weight = weight.add(this.biases[i]);
      // activation function!
      weight = weight.sigmoid();
      weights.push(weight);
    }
    // const data = Array.from(weights[weights.length - 1].dataSync().slice());
    // const sum = data.reduce((acc, val) => acc + val, 0);
    // weights[weights.length - 1] = mapTensor(
    //   weights[weights.length - 1],
    //   (e) => e / sum
    // );
    //console.log(data);
    // Sending back to the caller!

    // inputs.dispose();
    // hidden.dispose();
    // output.dispose();

    let errors = [];
    // Convert array to matrix object
    let targets = tf.tensor2d(target_array, [target_array.length, 1]);

    // Calculate the error
    // ERROR = TARGETS - OUTPUTS
    let output_errors = tf.sub(targets, weights[weights.length - 1]);

    errors.push(output_errors);
    let gradientsArray = [];
    let transposed = [];
    let deltas = [];

    for (let i = weights.length - 1; i >= 1; i--) {
      let index = weights.length - (i + 1);
      //console.log(index);
      // let gradient = outputs * (1 - outputs);
      // Calculate gradient
      let gradients = mapTensor(weights[i], this.activation_function.dfunc);
      gradients = gradients.mul(errors[index]);
      gradients = gradients.mul(this.learning_rate);

      gradientsArray.push(gradients);

      // Calculate deltas
      let transposedTensor = tf.transpose(weights[i - 1]);
      let weight_deltas = tf.dot(gradients, transposedTensor);

      transposed.push(transposedTensor);
      deltas.push(weight_deltas);

      // Adjust the weights by deltas
      this.weights[i - 1] = this.weights[i - 1].add(weight_deltas);
      // Adjust the bias by its deltas (which is just the gradients)
      this.biases[i - 1] = this.biases[i - 1].add(gradients);
      // Calculate the hidden layer errors
      let t = tf.transpose(this.weights[i - 1]);
      let error = tf.dot(t, errors[index]);
      errors.push(error);
    }

    for (let i = 0; i < weights.length; i++) {
      weights[i].dispose();
    }
    // inputs.dispose();
    // hidden.dispose();
    // outputs.dispose();
    targets.dispose();
    for (let i = 0; i < errors.length; i++) {
      errors[i].dispose();
    }
    for (let i = 0; i < gradientsArray.length; i++) {
      gradientsArray[i].dispose();
    }
    for (let i = 0; i < transposed.length; i++) {
      transposed[i].dispose();
    }
    for (let i = 0; i < deltas.length; i++) {
      deltas[i].dispose();
    }
    // output_errors.dispose();
    //gradients.dispose();
    // hidden_T.dispose();
    // weight_ho_deltas.dispose();
    // who_t.dispose();
    // hidden_errors.dispose();
    //hidden_gradient.dispose();
    // inputs_T.dispose();
    // weight_ih_deltas.dispose();

    // outputs.print();
    // targets.print();
    // error.print();
  }

  serialize() {
    return JSON.stringify(this);
  }

  // static deserialize(data) {
  //   if (typeof data == 'string') {
  //     data = JSON.parse(data);
  //   }
  //   let nn = new NeuroEvolution(
  //     data.input_nodes,
  //     data.hidden_nodes,
  //     data.output_nodes
  //   );
  //   nn.weights_ih = Matrix.deserialize(data.weights_ih);
  //   nn.weights_ho = Matrix.deserialize(data.weights_ho);
  //   nn.bias_h = Matrix.deserialize(data.bias_h);
  //   nn.bias_o = Matrix.deserialize(data.bias_o);
  //   nn.learning_rate = data.learning_rate;
  //   return nn;
  // }

  // Adding function for neuro-evolution
  copy() {
    return new NeuroEvolution(this);
  }

  // Accept an arbitrary function for mutation
  mutate(rate) {
    for (let i = 0; i < this.weights.length; i++) {
      const w = this.weights[i];
      const data = w.dataSync().slice();
      const { shape } = w;
      for (let i = 0; i < data.length; i++) {
        if (random(1) < rate) {
          data[i] += randomGaussian() * 0.5;
        }
      }
      this.weights[i] = tf.tensor2d(data, shape);
    }

    for (let i = 0; i < this.biases.length; i++) {
      const w = this.biases[i];
      const data = w.dataSync().slice();
      const { shape } = w;
      for (let i = 0; i < data.length; i++) {
        if (random(1) < rate) {
          data[i] += randomGaussian();
        }
      }
      this.biases[i] = tf.tensor2d(data, shape);
    }
  }

  save() {
    const json = {
      weights: [],
      biases: [],
      nodes: this.nodes,
    };

    for (let i = 0; i < this.weights.length; i++) {
      const w = this.weights[i];
      const data = w.dataSync();
      json.weights[i] = {
        weight: w,
        data,
      };
    }
    for (let i = 0; i < this.biases.length; i++) {
      const w = this.biases[i];
      const data = w.dataSync();
      json.biases[i] = {
        bias: w,
        data,
      };
    }

    saveJSON(json, "bestbird.json");
  }

  load(data) {
    return tf.tidy(() => {
      const nn = new NeuroEvolution(data.nodes);
      for (let i = 0; i < data.weights.length; i++) {
        const tensor = tf.tensor2d(
          data.weights[i].data,
          data.weights[i].weight.shape
        );
        nn.weights[i] = copyTensor(tensor);
      }
      for (let i = 0; i < data.biases.length; i++) {
        const tensor = tf.tensor2d(
          data.biases[i].data,
          data.biases[i].bias.shape
        );
        nn.biases[i] = copyTensor(tensor);
      }
      return nn;
    });
  }
}
