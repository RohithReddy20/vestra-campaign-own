'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useCallback, useState, forwardRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ShareURLBuilder } from '@/lib/share-utils';
import { PredictionProgress } from '@/types/types';
import { UselessPredictionsShareTemplate } from './useless-predictions-share-template';
import { trackShare } from '@/utils/analytics';

import twitter from '@/assets/images/twitter.svg';
import crystallBall from '@/assets/images/crystal-ball.svg';
import uselessPredictionsBg from '@/assets/images/useless-predictions-bg.svg';
import star from '@/assets/images/star.svg';
import whatsapp from '@/assets/images/whatsapp.svg';
import facebook from '@/assets/images/facebook.svg';
import linkedin from '@/assets/images/linkedin.svg';

export const UselessPredictions = forwardRef<
  HTMLDivElement,
  { predictionsData: PredictionProgress }
>(({ predictionsData }, ref) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if required data exists
  const canShare = Boolean(
    predictionsData.data.additional_data.predictions?.media_url &&
      predictionsData.data.additional_data.predictions?.campaign_id &&
      predictionsData.data.batch_id
  );

  const handleTwitterShare = useCallback(async () => {
    if (!canShare) {
      toast({
        title: 'Error',
        description: 'Required data for sharing is missing',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const urlBuilder = new ShareURLBuilder(window.location.origin);
    try {
      const mediaUrl = predictionsData.data.additional_data.predictions?.media_url;
      const campaignId = predictionsData.data.additional_data.predictions?.campaign_id;

      if (!mediaUrl || !campaignId) {
        throw new Error('Required share data is missing');
      }

      const { twitterShareUrl } = urlBuilder.buildShareUrls(
        predictionsData.data.batch_id,
        campaignId,
        'predictions',
        predictionsData.data.additional_data.predictions?.shareable_url || ''
      );

      trackShare('predictions', predictionsData.data.inputs.user_data.username);
      window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to share image',
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [predictionsData, toast, canShare]);

  const handleWhatsAppShare = useCallback(() => {
    const shareableUrl = predictionsData.data.additional_data.predictions?.shareable_url;
    if (!shareableUrl) {
      toast({
        title: 'Error',
        description: 'Shareable URL is missing',
        variant: 'destructive',
      });
      return;
    }
    const shareText = encodeURIComponent(
      `Check out my AI-generated predictions for 2025! ${shareableUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
    trackShare('predictions_whatsapp', predictionsData.data.inputs.user_data.username);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, [predictionsData, toast]);

  const handleFacebookShare = useCallback(() => {
    const shareableUrl = predictionsData.data.additional_data.predictions?.shareable_url;
    if (!shareableUrl) {
      toast({
        title: 'Error',
        description: 'Shareable URL is missing',
        variant: 'destructive',
      });
      return;
    }
    const shareText = encodeURIComponent(`Check out my AI-generated predictions for 2025!`);
    const url = encodeURIComponent(shareableUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`;
    trackShare('predictions_facebook', predictionsData.data.inputs.user_data.username);
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  }, [predictionsData, toast]);

  const handleLinkedInShare = useCallback(() => {
    const shareableUrl = predictionsData.data.additional_data.predictions?.shareable_url;
    if (!shareableUrl) {
      toast({
        title: 'Error',
        description: 'Shareable URL is missing',
        variant: 'destructive',
      });
      return;
    }
    const url = encodeURIComponent(shareableUrl);
    const title = encodeURIComponent('My AI-generated predictions for 2025');
    const summary = encodeURIComponent('Check out my AI-generated predictions for 2025!');
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    trackShare('predictions_linkedin', predictionsData.data.inputs.user_data.username);
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  }, [predictionsData, toast]);

  return (
    <Card className="p-6 md:p-10 rounded-2xl relative overflow-hidden border-none">
      <Image
        src={uselessPredictionsBg}
        alt="Resolutions Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 bg-[#FCDFE4]"
      />
      <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex justify-center items-center gap-2">
          <Image src={crystallBall} alt="Target" width={40} height={40} />
          <span className="text-[#141414] font-tfnr text-base md:text-xl font-bold">
            Predictions
          </span>
        </div>
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            className="text-sm font-semibold border-none text-white bg-[#292929] hover:bg-[#1c1c1c] hover:text-white font-tfnr"
            onClick={handleTwitterShare}
            disabled={loading || !canShare}
          >
            <span className="h-6 w-6">
              <Image src={twitter} height={24} width={24} alt="twitter" />
            </span>
            {loading ? 'Sharing...' : 'Share'}
          </Button>
          <Button
            className="bg-transparent p-0 h-10 w-10 hover:bg-slate-200"
            onClick={handleWhatsAppShare}
            disabled={!canShare}
          >
            <Image src={whatsapp} height={100} width={100} alt="whatsapp" />
          </Button>
          <Button
            className="bg-transparent p-0 h-10 w-10 hover:bg-slate-200"
            onClick={handleFacebookShare}
            disabled={!canShare}
          >
            <Image src={facebook} height={100} width={100} alt="facebook" />
          </Button>
          <Button
            className="bg-transparent p-0 h-10 w-10 hover:bg-slate-200"
            onClick={handleLinkedInShare}
            disabled={!canShare}
          >
            <Image src={linkedin} height={100} width={100} alt="linkedin" />
          </Button>
        </div>
      </div>
      <div className="my-5 h-px bg-[#262626] z-10 relative"></div>
      <div className="resolution-list flex flex-col gap-6 z-10">
        {predictionsData.data.outputs.predictions.predictions
          .slice(0, 3)
          .map((prediction, index) => (
            <div
              key={index}
              className="z-10 font-tfnr text-base text-left font-bold text-[#141414] flex flex-nowrap gap-x-2 items-center justify-start rounded-[12px] bg-[#fef6f766] backdrop-blur-[7.5px] p-5"
            >
              <Image src={star} height={20} width={20} alt="star" />
              {prediction.prediction}
            </div>
          ))}
      </div>
      <div className="fixed -z-50" style={{ left: '-9999px', top: '-9999px' }}>
        <div ref={ref}>
          <UselessPredictionsShareTemplate
            predictions={predictionsData.data.outputs.predictions.predictions}
          />
        </div>
      </div>
    </Card>
  );
});

UselessPredictions.displayName = 'UselessPredictions';
