import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  GitCommit,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  FolderGit2,
  FileText,
} from 'lucide-react';

interface GithubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitStatus {
  repo: string;
  branch: string;
  remoteUrl: string;
  changedFiles: string[];
  changeCount: number;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  } | null;
}

interface UserVerification {
  valid: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
  message?: string;
}

export const GithubSyncModal: React.FC<GithubSyncModalProps> = ({ isOpen, onClose }) => {
  // Read PAT from local storage if previously entered, without hardcoding tokens in code
  const [pat, setPat] = useState<string>(() => {
    try {
      return localStorage.getItem('foodie_github_pat') || '';
    } catch {
      return '';
    }
  });
  const [showToken, setShowToken] = useState<boolean>(false);
  const [commitMessage, setCommitMessage] = useState<string>(
    'Add rich Indian street dishes, local assets, and interactive menus'
  );

  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verification, setVerification] = useState<UserVerification | null>(null);

  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    commitHash?: string;
    repoUrl?: string;
  } | null>(null);

  // Fetch status on open
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch git status', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      if (pat) {
        handleVerifyToken(pat);
      }
    }
  }, [isOpen]);

  const handleVerifyToken = async (tokenToVerify?: string) => {
    const token = tokenToVerify || pat;
    if (!token) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setVerification(data);
    } catch (err: any) {
      setVerification({ valid: false, message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePush = async () => {
    if (!pat.trim()) return;
    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pat: pat.trim(),
          commitMessage: commitMessage.trim(),
          branch: gitStatus?.branch || 'main',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message,
          commitHash: data.commitHash,
          repoUrl: data.repoUrl || 'https://github.com/Aryan-singh19/Foodie',
        });
        fetchStatus();
      } else {
        setPushResult({
          success: false,
          error: data.error || 'Push failed. Please check token permissions.',
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        error: err.message || 'Network error while attempting to push.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2422]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="github-sync-preview-modal"
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-2xl border border-[#EBE3D5] my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#EBE3D5] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D2422] text-white flex items-center justify-center shadow-xs">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#2D2422]">GitHub Repository Sync</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E04D01]/10 text-[#E04D01]">
                  <GitBranch className="w-3 h-3" />
                  {gitStatus?.branch || 'main'}
                </span>
              </div>
              <p className="text-xs text-[#6A5C58]">
                Sync local Foodie updates & assets directly to{' '}
                <a
                  href="https://github.com/Aryan-singh19/Foodie"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#2D2422] hover:text-[#E04D01] underline inline-flex items-center gap-1"
                >
                  Aryan-singh19/Foodie
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          <button
            id="close-github-sync-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-[#6A5C58] hover:text-[#2D2422] flex items-center justify-center border border-[#EBE3D5] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* GitHub User Verification Banner */}
          {verification && verification.valid && (
            <div className="p-3.5 rounded-2xl bg-[#348A54]/10 border border-[#348A54]/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {verification.avatar_url && (
                  <img
                    src={verification.avatar_url}
                    alt={verification.name || 'User'}
                    className="w-10 h-10 rounded-full border border-[#348A54]/40"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#2D2422]">{verification.name}</span>
                    <span className="text-xs font-mono text-[#6A5C58]">@{verification.login}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#348A54] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Authenticated & ready to push
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded-lg bg-white border border-[#348A54]/30 text-[#348A54]">
                Target: Foodie
              </span>
            </div>
          )}

          {/* Token Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6A5C58] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#E04D01]" />
                Personal Access Token (PAT)
              </label>
              <button
                type="button"
                onClick={() => handleVerifyToken()}
                disabled={isVerifying || !pat}
                className="text-xs font-semibold text-[#E04D01] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                Test Token
              </button>
            </div>
            <div className="relative">
              <input
                id="github-pat-token-input"
                type={showToken ? 'text' : 'password'}
                value={pat}
                onChange={(e) => {
                  const val = e.target.value;
                  setPat(val);
                  setVerification(null);
                  try {
                    localStorage.setItem('foodie_github_pat', val);
                  } catch {
                    // ignore
                  }
                }}
                placeholder="Paste your GitHub Personal Access Token"
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-mono bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01] focus:ring-1 focus:ring-[#E04D01]"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A5C58] hover:text-[#2D2422] cursor-pointer"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Commit Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6A5C58] flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-[#E04D01]" />
              Commit Message
            </label>
            <input
              id="github-commit-message-input"
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Summary of changes to commit"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01] focus:ring-1 focus:ring-[#E04D01]"
            />
          </div>

          {/* Changes Preview */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E04D01]" />
                <span className="text-xs font-bold text-[#2D2422]">
                  Changes Ready to Sync ({gitStatus?.changeCount ?? '...'} items)
                </span>
              </div>
              <button
                onClick={fetchStatus}
                disabled={isLoadingStatus}
                className="text-[11px] text-[#6A5C58] hover:text-[#2D2422] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {gitStatus?.changedFiles && gitStatus.changedFiles.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {gitStatus.changedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#EBE3D5] flex items-center justify-between text-[#2D2422]"
                  >
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6A5C58] italic">
                Working directory is up to date or ready for push.
              </p>
            )}

            {gitStatus?.lastCommit && (
              <div className="pt-2 border-t border-[#EBE3D5] flex items-center justify-between text-[11px] text-[#6A5C58]">
                <span>
                  Latest commit: <strong className="font-mono text-[#2D2422]">{gitStatus.lastCommit.hash}</strong>
                </span>
                <span className="truncate max-w-xs">{gitStatus.lastCommit.message}</span>
              </div>
            )}
          </div>

          {/* Push Result Alerts */}
          {pushResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
                pushResult.success
                  ? 'bg-[#348A54]/10 border border-[#348A54]/30 text-[#2D2422]'
                  : 'bg-[#D93B3B]/10 border border-[#D93B3B]/30 text-[#2D2422]'
              }`}
            >
              {pushResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-[#348A54] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#D93B3B] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {pushResult.success ? 'Push Successful!' : 'Push Operation Failed'}
                </p>
                <p className="text-[#6A5C58]">{pushResult.message || pushResult.error}</p>
                {pushResult.repoUrl && (
                  <a
                    href={pushResult.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#348A54] hover:underline mt-1"
                  >
                    View on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#EBE3D5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6A5C58] hover:text-[#2D2422] cursor-pointer"
          >
            Close
          </button>

          <button
            id="execute-github-push-btn"
            onClick={handlePush}
            disabled={isPushing || !pat.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#E04D01] hover:bg-[#C74200] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
            <span>{isPushing ? 'Pushing to GitHub...' : 'Push to GitHub (origin/main)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
