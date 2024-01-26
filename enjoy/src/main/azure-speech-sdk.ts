import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs-extra";
import log from "electron-log/main";

const logger = log.scope("AZURE");
export class AzureSpeechSdk {
  private config: sdk.SpeechConfig;

  constructor(token: string, region: string) {
    this.config = sdk.SpeechConfig.fromAuthorizationToken(token, region);
  }

  pronunciationAssessment(params: {
    filePath: string;
    reference: string;
    language?: string;
  }): Promise<sdk.PronunciationAssessmentResult> {
    const { filePath, reference, language = "en-US" } = params;

    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(filePath)
    );

    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      reference,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationAssessmentConfig.phonemeAlphabet = "IPA";

    // setting the recognition language to English.
    this.config.speechRecognitionLanguage = language;

    // create the speech recognizer.
    const reco = new sdk.SpeechRecognizer(this.config, audioConfig);
    pronunciationAssessmentConfig.applyTo(reco);

    logger.debug("Start pronunciation assessment.");
    return new Promise((resolve, reject) => {
      reco.recognizeOnceAsync((result) => {
        reco.close();

        switch (result.reason) {
          case sdk.ResultReason.RecognizedSpeech:
            const pronunciationResult =
              sdk.PronunciationAssessmentResult.fromResult(result);
            logger.debug(
              "Received pronunciation assessment result.",
              pronunciationResult.detailResult
            );
            resolve(pronunciationResult);
            break;
          case sdk.ResultReason.NoMatch:
            reject(new Error("No speech could be recognized."));
            break;
          case sdk.ResultReason.Canceled:
            const cancellationDetails =
              sdk.CancellationDetails.fromResult(result);
            logger.debug(
              "CANCELED: Reason=" +
                cancellationDetails.reason +
                " ErrorDetails=" +
                cancellationDetails.errorDetails
            );
            reject(new Error(cancellationDetails.errorDetails));
            break;
          default:
            reject(result);
        }
      });
    });
  }

  async transcribe(params: {
    filePath: string;
    language?: string;
  }): Promise<SpeechRecognitionResultType> {
    const { filePath, language = "en-US" } = params;

    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(filePath)
    );

    // setting the recognition language to English.
    this.config.speechRecognitionLanguage = language;
    this.config.requestWordLevelTimestamps();
    this.config.outputFormat = sdk.OutputFormat.Detailed;

    // create the speech recognizer.
    const reco = new sdk.SpeechRecognizer(this.config, audioConfig);

    logger.debug("Start transcribe.");
    return new Promise((resolve, reject) => {
      reco.recognizeOnceAsync((result) => {
        reco.close();

        switch (result.reason) {
          case sdk.ResultReason.RecognizedSpeech:
            const json = result.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult
            );
            resolve(JSON.parse(json));
            break;
          case sdk.ResultReason.NoMatch:
            reject(new Error("No speech could be recognized."));
            break;
          case sdk.ResultReason.Canceled:
            const cancellationDetails =
              sdk.CancellationDetails.fromResult(result);
            logger.debug(
              "CANCELED: Reason=" +
                cancellationDetails.reason +
                " ErrorDetails=" +
                cancellationDetails.errorDetails
            );
            reject(new Error(cancellationDetails.errorDetails));
            break;
          default:
            reject(result);
        }
      });
    });
  }
}
