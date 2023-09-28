export type SpotifyOptionType =
  // Standard options
  | "acousticness"
  | "danceability"
  | "energy"
  | "instrumentalness"
  | "liveness"
  | "speechiness"
  | "valence"
  // Advanced options
  | "tempo"
  | "key"
  | "mode"
  | "time_signature";

export interface SpotifyOption {
  name: SpotifyOptionType;
  display_name: string;
  target_name: string;
  description: string;
  enabled: boolean;
  value: number;
  advanced: boolean;
  type: SpotifyOptionSliderType | SpotifyOptionsSelectType;
}

export class SpotifyOptionSliderType {
  public min;
  public max;
  public step;

  constructor(min: number, max: number, step: number) {
    this.min = min;
    this.max = max;
    this.step = step;
  }
}

export class SpotifyOptionsSelectType {
  public options: { name: string; value: number }[] = [];

  constructor(options: { name: string; value: number }[]) {
    this.options = options;
  }
}

export function spotifyDefaultOptions(
  trackStats: SpotifyApi.AudioFeaturesObject
): SpotifyOption[] {
  return [
    {
      name: "acousticness",
      description:
        "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
      display_name: "Acousticness",
      target_name: "target_acousticness",
      enabled: false,
      value: trackStats.acousticness,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
    {
      name: "danceability",
      description:
        "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
      display_name: "Danceability",
      target_name: "target_danceability",
      enabled: false,
      value: trackStats.danceability,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
    {
      name: "energy",
      description:
        "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
      display_name: "Energy",
      target_name: "target_energy",
      enabled: false,
      value: trackStats.energy,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
    {
      name: "instrumentalness",
      description:
        'Predicts whether a track contains no vocals. "Ooh" and "aah" sounds are treated as instrumental in this hooks. Rap or spoken word tracks are clearly "vocal". The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.',
      display_name: "Instrumentalness",
      target_name: "target_instrumentalness",
      enabled: false,
      value: trackStats.instrumentalness,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },

    {
      name: "speechiness",
      description:
        "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
      display_name: "Speechiness",
      target_name: "target_speechiness",
      enabled: false,
      value: trackStats.speechiness,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
    {
      name: "tempo",
      description:
        "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.",
      display_name: "Tempo (BPM)",
      target_name: "target_tempo",
      enabled: false,
      value: trackStats.tempo,
      advanced: true,
      type: new SpotifyOptionSliderType(0, 250, 1),
    },
    {
      name: "valence",
      description:
        "A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).",
      display_name: "Valence",
      target_name: "target_valence",
      enabled: false,
      value: trackStats.valence,
      advanced: false,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
    {
      name: "key",
      description: "The key the track is in.",
      display_name: "Key",
      target_name: "target_key",
      enabled: false,
      advanced: true,
      value: trackStats.key,
      type: new SpotifyOptionsSelectType([
        { name: "C", value: 0 },
        { name: "C♯, D♭", value: 1 },
        { name: "D", value: 2 },
        { name: "D♯, E♭", value: 3 },
        { name: "E", value: 4 },
        { name: "F", value: 5 },
        { name: "F♯", value: 6 },
        { name: "G", value: 7 },
        { name: "G♯, A♭", value: 8 },
        { name: "A", value: 9 },
        { name: "A♯, B♭", value: 10 },
        { name: "B", value: 11 },
      ]),
    },
    {
      name: "mode",
      description:
        "Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived.",
      display_name: "Mode",
      target_name: "target_mode",
      enabled: false,
      advanced: true,
      value: trackStats.mode,
      type: new SpotifyOptionsSelectType([
        { name: "Minor", value: 0 },
        { name: "Major", value: 1 },
      ]),
    },
    {
      name: "time_signature",
      description:
        "An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).",
      display_name: "Time Signature",
      target_name: "target_time_signature",
      enabled: false,
      advanced: true,
      value: trackStats.time_signature,
      type: new SpotifyOptionsSelectType([
        { name: "3/4", value: 3 },
        { name: "4/4", value: 4 },
        { name: "5/4", value: 5 },
        { name: "6/4", value: 6 },
        { name: "7/4", value: 7 },
      ]),
    },
    {
      name: "liveness",
      description:
        "Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
      display_name: "Liveness",
      target_name: "target_liveness",
      enabled: false,
      value: trackStats.liveness,
      advanced: true,
      type: new SpotifyOptionSliderType(0, 1, 0.01),
    },
  ];
}
