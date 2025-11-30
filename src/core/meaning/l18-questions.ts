import type { MeaningKernelState } from "./l18-types";

export interface ExistentialAnswers {
  whyAreYouHere: {
    summary: string;
    purposeVector: {
      inner: number;
      social: number;
      cosmic: number;
    };
    tags: string[];
  };
  relationToFiniteness: {
    finitenessIndex: number;
    description: string;
  };
  satisfaction: {
    contentment: number;
    description: string;
  };
}

/**
 * Лёгкий слой, который превращает MeaningKernelState в "ответы".
 * Это уже можно выводить в UI или отдавать агенту.
 */
export const evaluateExistentialQuestions = (
  mk: MeaningKernelState
): ExistentialAnswers => {
  const { purpose, finiteness, contentment } = mk;

  const whySummary =
    purpose.narrative ||
    "This organism exists to balance inner growth, social contribution and systemic impact.";

  let finitenessDesc: string;
  if (finiteness.value < 0.3) {
    finitenessDesc =
      "Acts as if time and resources are almost unlimited. Long-term horizons dominate.";
  } else if (finiteness.value < 0.7) {
    finitenessDesc =
      "Maintains a balanced awareness of limited time and resources.";
  } else {
    finitenessDesc =
      "Strongly aware of finite time and resources; prioritization is critical.";
  }

  let satisfactionDesc: string;
  if (contentment.value < 0.3) {
    satisfactionDesc =
      "Currently not satisfied with its trajectory; purpose alignment and/or goals likely need revision.";
  } else if (contentment.value < 0.7) {
    satisfactionDesc =
      "Moderately satisfied, with room for adjustment and refinement.";
  } else {
    satisfactionDesc =
      "Deeply aligned with its direction; current trajectory feels meaningful.";
  }

  return {
    whyAreYouHere: {
      summary: whySummary,
      purposeVector: {
        inner: purpose.inner,
        social: purpose.social,
        cosmic: purpose.cosmic,
      },
      tags: purpose.tags,
    },
    relationToFiniteness: {
      finitenessIndex: finiteness.value,
      description: finitenessDesc,
    },
    satisfaction: {
      contentment: contentment.value,
      description: satisfactionDesc,
    },
  };
};
