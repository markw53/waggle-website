// src/services/breedMatcher.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Dog } from '@/types/dog';
import type { BreedInfo } from '@/types/breed';

interface BreedMatch {
  dog: Dog;
  breedInfo: BreedInfo | null;
  compatibilityScore: number;
  reasons: string[];
  warnings: string[];
  benefits: string[];
}

// REMOVED: MatchCriteria interface (it was never used)

export class BreedMatcher {
  // Get breed info from database
  private async getBreedInfo(breedName: string): Promise<BreedInfo | null> {
    try {
      const breedId = breedName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const breedDoc = await getDoc(doc(db, 'breeds', breedId));
      return breedDoc.exists() ? (breedDoc.data() as BreedInfo) : null;
    } catch (error: unknown) {
      console.error('Error fetching breed info:', error);
      return null;
    }
  }

  // Parse size category from breed info
  private getSizeCategory(breedInfo: BreedInfo | null): 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'unknown' {
    if (!breedInfo?.weight) return 'unknown';
    
    const weightStr = breedInfo.weight.toLowerCase();
    const avgWeight = this.parseAverageWeight(weightStr);
    
    if (avgWeight < 15) return 'toy';
    if (avgWeight < 30) return 'small';
    if (avgWeight < 60) return 'medium';
    if (avgWeight < 100) return 'large';
    return 'giant';
  }

  private parseAverageWeight(weightStr: string): number {
    const match = weightStr.match(/(\d+)-(\d+)/);
    if (match) {
      return (parseInt(match[1]) + parseInt(match[2])) / 2;
    }
    const singleMatch = weightStr.match(/(\d+)/);
    return singleMatch ? parseInt(singleMatch[1]) : 50;
  }

  // Calculate health compatibility (avoid same health issues)
  private calculateHealthCompatibility(
    dog1BreedInfo: BreedInfo | null,
    dog2BreedInfo: BreedInfo | null
  ): { score: number; reasons: string[] } {
    if (!dog1BreedInfo || !dog2BreedInfo) {
      return { score: 50, reasons: ['Insufficient health data for comparison'] };
    }

    const health1 = dog1BreedInfo.healthProblems.toLowerCase();
    const health2 = dog2BreedInfo.healthProblems.toLowerCase();
    
    const reasons: string[] = [];
    
    // Common serious health issues to check
    const seriousIssues = [
      'hip dysplasia',
      'elbow dysplasia',
      'heart disease',
      'cancer',
      'epilepsy',
      'progressive retinal atrophy'
    ];
    
    let sharedIssues = 0;
    const foundIssues: string[] = [];
    
    seriousIssues.forEach(issue => {
      if (health1.includes(issue) && health2.includes(issue)) {
        sharedIssues++;
        foundIssues.push(issue);
      }
    });
    
    if (sharedIssues === 0) {
      reasons.push('No shared genetic health issues detected');
      return { score: 95, reasons };
    }
    
    if (sharedIssues === 1) {
      reasons.push(`⚠️ Both breeds prone to ${foundIssues[0]} - genetic counseling recommended`);
      return { score: 60, reasons };
    }
    
    reasons.push(`⚠️ Multiple shared health risks: ${foundIssues.join(', ')}`);
    return { score: 30, reasons };
  }

  // Calculate size compatibility
  private calculateSizeCompatibility(
    dog1: Dog,
    dog1BreedInfo: BreedInfo | null,
    dog2: Dog,
    dog2BreedInfo: BreedInfo | null
  ): { score: number; reasons: string[] } {
    const size1 = this.getSizeCategory(dog1BreedInfo);
    const size2 = this.getSizeCategory(dog2BreedInfo);
    
    const reasons: string[] = [];
    
    if (size1 === 'unknown' || size2 === 'unknown') {
      return { score: 50, reasons: ['Size data incomplete'] };
    }
    
    const sizeOrder = ['toy', 'small', 'medium', 'large', 'giant'];
    const diff = Math.abs(sizeOrder.indexOf(size1) - sizeOrder.indexOf(size2));
    
    if (diff === 0) {
      reasons.push('✅ Perfect size match - similar build');
      return { score: 100, reasons };
    }
    
    if (diff === 1) {
      reasons.push('✅ Good size compatibility - manageable difference');
      return { score: 85, reasons };
    }
    
    if (diff === 2) {
      reasons.push('⚠️ Moderate size difference - breeding may require assistance');
      return { score: 60, reasons };
    }
    
    // Female should be larger for extreme size differences
    // REMOVED: unused female and male variables
    const femaleBreed = dog1.gender === 'Female' ? dog1BreedInfo : dog2BreedInfo;
    const maleBreed = dog1.gender === 'Male' ? dog1BreedInfo : dog2BreedInfo;
    
    const femaleSize = this.getSizeCategory(femaleBreed);
    const maleSize = this.getSizeCategory(maleBreed);
    
    if (sizeOrder.indexOf(femaleSize) < sizeOrder.indexOf(maleSize)) {
      reasons.push('❌ Significant size mismatch - female is smaller than male');
      reasons.push('⚠️ High risk pregnancy - not recommended');
      return { score: 20, reasons };
    }
    
    reasons.push('⚠️ Large size difference - veterinary supervision required');
    return { score: 40, reasons };
  }

  // Calculate type compatibility
  private calculateTypeCompatibility(
    breed1Info: BreedInfo | null,
    breed2Info: BreedInfo | null
  ): { score: number; reasons: string[] } {
    if (!breed1Info || !breed2Info) {
      return { score: 50, reasons: ['Breed type data incomplete'] };
    }

    const reasons: string[] = [];
    
    if (breed1Info.type === breed2Info.type) {
      reasons.push(`✅ Same group (${breed1Info.type}) - consistent traits`);
      return { score: 90, reasons };
    }
    
    // Compatible type pairings
    const compatiblePairs: Record<string, string[]> = {
      'Sporting': ['Sporting', 'Working', 'Herding'],
      'Working': ['Working', 'Sporting', 'Herding'],
      'Herding': ['Herding', 'Working', 'Sporting'],
      'Hound': ['Hound', 'Sporting'],
      'Terrier': ['Terrier', 'Working'],
      'Toy': ['Toy', 'Non-Sporting'],
      'Non-Sporting': ['Non-Sporting', 'Toy', 'Sporting']
    };
    
    const compatible = compatiblePairs[breed1Info.type]?.includes(breed2Info.type) || false;
    
    if (compatible) {
      reasons.push(`✅ Compatible groups (${breed1Info.type} × ${breed2Info.type})`);
      return { score: 75, reasons };
    }
    
    reasons.push(`⚠️ Different groups (${breed1Info.type} × ${breed2Info.type}) - varied offspring traits`);
    return { score: 55, reasons };
  }

  // Calculate genetic diversity (same breed = lower score)
  private calculateGeneticDiversity(
    dog1: Dog,
    dog2: Dog
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    
    if (dog1.breed === dog2.breed) {
      reasons.push('⚠️ Same breed - ensure parents are not related');
      reasons.push('Consider checking pedigrees for inbreeding coefficient');
      return { score: 60, reasons };
    }
    
    reasons.push('✅ Cross-breeding provides genetic diversity');
    reasons.push('May produce hybrid vigor in offspring');
    return { score: 95, reasons };
  }

  // Calculate cost efficiency
  private calculateCostEfficiency(
    breed1Info: BreedInfo | null,
    breed2Info: BreedInfo | null
  ): { score: number; reasons: string[] } {
    if (!breed1Info || !breed2Info) {
      return { score: 50, reasons: [] };
    }

    const avgCost = (breed1Info.yearlyExpenses + breed2Info.yearlyExpenses) / 2;
    const avgPuppyPrice = (breed1Info.avgPuppyPrice + breed2Info.avgPuppyPrice) / 2;
    const reasons: string[] = [];
    
    reasons.push(`Expected yearly cost per puppy: $${Math.round(avgCost).toLocaleString()}`);
    reasons.push(`Expected puppy value: $${Math.round(avgPuppyPrice).toLocaleString()}`);
    
    // Higher puppy value vs cost = better score
    const ratio = avgPuppyPrice / avgCost;
    
    if (ratio > 3) {
      return { score: 90, reasons };
    }
    if (ratio > 2) {
      return { score: 75, reasons };
    }
    if (ratio > 1) {
      return { score: 60, reasons };
    }
    
    return { score: 45, reasons };
  }

  // Main compatibility calculation
  public async calculateCompatibility(dog1: Dog, dog2: Dog): Promise<BreedMatch> {
    const breed1Info = await this.getBreedInfo(dog1.breed);
    const breed2Info = await this.getBreedInfo(dog2.breed);

    const health = this.calculateHealthCompatibility(breed1Info, breed2Info);
    const size = this.calculateSizeCompatibility(dog1, breed1Info, dog2, breed2Info);
    const type = this.calculateTypeCompatibility(breed1Info, breed2Info);
    const genetics = this.calculateGeneticDiversity(dog1, dog2);
    const cost = this.calculateCostEfficiency(breed1Info, breed2Info);

    // Weighted average (health and size are most important)
    const compatibilityScore = Math.round(
      health.score * 0.35 +
      size.score * 0.30 +
      type.score * 0.15 +
      genetics.score * 0.15 +
      cost.score * 0.05
    );

    const reasons: string[] = [];
    const warnings: string[] = [];
    const benefits: string[] = [];

    // Categorize all reasons
    [health, size, type, genetics, cost].forEach(result => {
      result.reasons.forEach(reason => {
        if (reason.startsWith('❌')) warnings.push(reason);
        else if (reason.startsWith('⚠️')) warnings.push(reason);
        else if (reason.startsWith('✅')) benefits.push(reason);
        else reasons.push(reason);
      });
    });

    return {
      dog: dog2,
      breedInfo: breed2Info,
      compatibilityScore,
      reasons,
      warnings,
      benefits
    };
  }

  // Find best matches for a dog
  public async findBestMatches(
    targetDog: Dog,
    candidateDogs: Dog[],
    limit: number = 10
  ): Promise<BreedMatch[]> {
    const matches: BreedMatch[] = [];

    for (const candidate of candidateDogs) {
      // Skip if same dog
      if (candidate.id === targetDog.id) continue;
      
      // Skip if same owner
      if (candidate.ownerId === targetDog.ownerId) continue;
      
      // Skip if same gender
      if (candidate.gender === targetDog.gender) continue;

      const match = await this.calculateCompatibility(targetDog, candidate);
      matches.push(match);
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return matches.slice(0, limit);
  }
}

// Export singleton instance
export const breedMatcher = new BreedMatcher();