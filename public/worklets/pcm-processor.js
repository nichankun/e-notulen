class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const requestedRate = options?.processorOptions?.targetSampleRate || 16000;
    this.targetSampleRate = Math.min(requestedRate, sampleRate);
    this.chunkSamples = Math.max(
      160,
      Math.round(
        this.targetSampleRate *
          ((options?.processorOptions?.chunkMs || 40) / 1000),
      ),
    );
    this.inputBuffer = new Float32Array(0);
    this.sourceOffset = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;

    const combined = new Float32Array(this.inputBuffer.length + input.length);
    combined.set(this.inputBuffer);
    combined.set(input, this.inputBuffer.length);
    this.inputBuffer = combined;

    const ratio = sampleRate / this.targetSampleRate;
    const available = Math.floor(
      (combined.length - 1 - this.sourceOffset) / ratio,
    );
    if (available < this.chunkSamples) return true;

    const int16 = new Int16Array(this.chunkSamples);
    for (let i = 0; i < this.chunkSamples; i += 1) {
      const position = this.sourceOffset + i * ratio;
      const left = Math.floor(position);
      const right = Math.min(left + 1, combined.length - 1);
      const fraction = position - left;
      const sample = combined[left] * (1 - fraction) + combined[right] * fraction;
      const clamped = Math.max(-1, Math.min(1, sample));
      int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }

    const consumed = Math.floor(
      this.sourceOffset + this.chunkSamples * ratio,
    );
    this.sourceOffset =
      this.sourceOffset + this.chunkSamples * ratio - consumed;
    this.inputBuffer = combined.slice(consumed);
    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
