import React from 'react';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
  UserX
} from 'lucide-react';

const USER_STATUS_OPTIONS = ['ACTIVE', 'DISABLED', 'PENDING_VERIFICATION'];

const formatDateTime = (value) => {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN');
};

const getStatusMeta = (status = '') => {
  const normalized = String(status).toUpperCase();
  if (normalized === 'ACTIVE') {
    return {
      label: 'Đang hoạt động',
      icon: UserCheck,
      className: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
    };
  }
  if (normalized === 'DISABLED') {
    return {
      label: 'Đã vô hiệu',
      icon: UserX,
      className: 'border-rose-500/35 bg-rose-950/20 text-rose-300'
    };
  }
  return {
    label: 'Chờ xác minh',
    icon: ShieldAlert,
    className: 'border-amber-500/35 bg-amber-950/20 text-amber-300'
  };
};

export default function AdminUsersPanel({ ctx }) {
  const {
    activeTab,
    adminUsers,
    selectedAdminUser,
    userSearch,
    setUserSearch,
    isUsersLoading,
    isUserDetailLoading,
    isUserStatusSaving,
    fetchAdminUsers,
    handleSelectAdminUser,
    handleUpdateAdminUserStatus,
    currentUser
  } = ctx;

  if (activeTab !== 'users') return null;

  const query = userSearch.trim().toLowerCase();
  const filteredUsers = adminUsers.filter((user) => {
    if (!query) return true;
    return (
      user.email?.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      String(user.id || '').includes(query)
    );
  });

  const selectedStatus = getStatusMeta(selectedAdminUser?.status);
  const SelectedStatusIcon = selectedStatus.icon;
  const isViewingCurrentAdmin =
    String(currentUser?.id || '') === String(selectedAdminUser?.id || '') ||
    (currentUser?.email && selectedAdminUser?.email && currentUser.email === selectedAdminUser.email);

  return (
    <motion.div
      key="panel-users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 border border-neutral-850 bg-[#070707] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-[8px] font-mono font-black uppercase tracking-widest text-amber-400">
            ADMIN USER CONTROL
          </span>
          <h2 className="text-sm font-sans font-black uppercase tracking-wider text-zinc-200">
            Quản lý người dùng hệ thống
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchAdminUsers}
          disabled={isUsersLoading}
          className="flex items-center justify-center gap-2 border border-neutral-800 bg-black px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 border border-neutral-850 bg-neutral-950 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-neutral-850 bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Users className="h-4 w-4 text-amber-400" />
              Danh sách tài khoản
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm email, tên, SĐT..."
                className="w-full border border-neutral-800 bg-[#050505] py-2 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-neutral-700 focus:border-amber-400"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-900">
            <div className="hidden grid-cols-[42px_minmax(0,1.6fr)_minmax(86px,0.75fr)_minmax(74px,0.65fr)_minmax(118px,0.85fr)_48px] gap-2 bg-[#050505] px-3 py-3 text-[8px] uppercase tracking-widest text-neutral-500 lg:grid">
              <span>ID</span>
              <span>Người dùng</span>
              <span>Liên hệ</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
              <span className="text-right">Xem</span>
            </div>

            {isUsersLoading ? (
              <div className="px-4 py-10 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Đang tải danh sách người dùng...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const statusMeta = getStatusMeta(user.status);
                const StatusIcon = statusMeta.icon;
                const isSelected = String(selectedAdminUser?.id) === String(user.id);

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-1 gap-3 px-3 py-3 text-xs transition lg:grid-cols-[42px_minmax(0,1.6fr)_minmax(86px,0.75fr)_minmax(74px,0.65fr)_minmax(118px,0.85fr)_48px] lg:items-center ${isSelected ? 'bg-amber-500/5' : 'hover:bg-neutral-900/45'}`}
                  >
                    <div className="font-mono text-neutral-500">#{user.id}</div>

                    <div className="min-w-0">
                      <div className="truncate font-black text-white">
                        {user.fullName || 'Chưa cập nhật tên'}
                      </div>
                      <div className="truncate text-[10px] text-neutral-500">{user.email}</div>
                    </div>

                    <div className="min-w-0 text-neutral-400">
                      <span className="lg:hidden text-[8px] uppercase tracking-widest text-neutral-600">
                        Liên hệ:{' '}
                      </span>
                      <span className="break-words">{user.phone || 'Chưa có SĐT'}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || []).map((role) => (
                          <span
                            key={role}
                            className="border border-neutral-800 bg-black px-1.5 py-0.5 text-[8px] font-bold uppercase text-neutral-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <span className={`inline-flex max-w-full items-center gap-1.5 border px-2 py-1 text-[8px] font-black uppercase ${statusMeta.className}`}>
                        <StatusIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{statusMeta.label}</span>
                      </span>
                    </div>

                    <div className="lg:text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectAdminUser(user.id)}
                        className="border border-neutral-800 px-2.5 py-1.5 text-[9px] font-bold uppercase text-neutral-300 transition hover:border-white hover:text-white"
                      >
                        Xem
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Không tìm thấy người dùng phù hợp
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-5 border border-neutral-850 bg-[#070707] p-5">
          {selectedAdminUser ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-neutral-850 pb-4">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                    Hồ sơ người dùng
                  </span>
                  <h3 className="mt-1 break-words text-lg font-serif italic text-white">
                    {selectedAdminUser.fullName || selectedAdminUser.email}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-500">ID #{selectedAdminUser.id}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-black uppercase ${selectedStatus.className}`}>
                  <SelectedStatusIcon className="h-3.5 w-3.5" />
                  {selectedStatus.label}
                </span>
              </div>

              {isUserDetailLoading ? (
                <div className="py-12 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Đang tải chi tiết...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="border border-neutral-850 bg-black p-3">
                      <div className="flex items-center gap-2 text-[9px] uppercase text-neutral-500">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </div>
                      <div className="mt-1 break-all text-xs font-bold text-white">{selectedAdminUser.email}</div>
                    </div>
                    <div className="border border-neutral-850 bg-black p-3">
                      <div className="flex items-center gap-2 text-[9px] uppercase text-neutral-500">
                        <Phone className="h-3.5 w-3.5" /> Số điện thoại
                      </div>
                      <div className="mt-1 break-words text-xs font-bold text-white">
                        {selectedAdminUser.phone || 'Chưa cập nhật'}
                      </div>
                    </div>
                    <div className="border border-neutral-850 bg-black p-3">
                      <div className="flex items-center gap-2 text-[9px] uppercase text-neutral-500">
                        <BadgeCheck className="h-3.5 w-3.5" /> Xác minh
                      </div>
                      <div className="mt-1 text-xs font-bold leading-relaxed text-white">
                        Email: {selectedAdminUser.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'} / SĐT:{' '}
                        {selectedAdminUser.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </div>
                    </div>
                    <div className="border border-neutral-850 bg-black p-3">
                      <div className="flex items-center gap-2 text-[9px] uppercase text-neutral-500">
                        <Clock className="h-3.5 w-3.5" /> Cập nhật
                      </div>
                      <div className="mt-1 text-xs font-bold text-white">
                        {formatDateTime(selectedAdminUser.updatedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-850 bg-black p-4 space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Đổi trạng thái tài khoản
                    </div>
                    {isViewingCurrentAdmin && (
                      <div className="border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-bold leading-relaxed text-amber-200">
                        Không thể đổi trạng thái của chính tài khoản admin đang đăng nhập.
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {USER_STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={isViewingCurrentAdmin || isUserStatusSaving || selectedAdminUser.status === status}
                          onClick={() => handleUpdateAdminUserStatus(selectedAdminUser.id, status)}
                          className={`min-w-0 border px-2 py-2 text-[8px] font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-45 ${
                            selectedAdminUser.status === status
                              ? 'border-amber-400 bg-amber-500 text-black'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-amber-400 hover:text-amber-300'
                          }`}
                        >
                          <span className="block truncate">{status}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] leading-relaxed text-neutral-500">
                    Tạo lúc:{' '}
                    <span className="font-mono text-neutral-300">
                      {formatDateTime(selectedAdminUser.createdAt)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-500">
              <Users className="mx-auto h-8 w-8 text-neutral-700" />
              <p className="mt-3 text-xs font-mono uppercase tracking-widest">Chưa chọn người dùng</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
